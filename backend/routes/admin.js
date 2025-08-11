const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Admin middleware
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: true, message: 'Admin access required' });
  }
  next();
};

// Get pending facilities for approval
router.get('/facilities/pending', auth, adminAuth, async (req, res) => {
  try {
    const facilities = await prisma.facility.findMany({
      where: { status: 'PENDING' },
      include: {
        owner: {
          select: { fullName: true, email: true }
        }
      }
    });

    res.json({ success: true, facilities });
  } catch (error) {
    console.error('Get pending facilities error:', error);
    res.status(500).json({ error: true, message: 'Failed to get pending facilities' });
  }
});

// Approve/Reject facility
router.put('/facilities/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: true, message: 'Invalid status' });
    }

    const facility = await prisma.facility.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json({ success: true, message: `Facility ${status.toLowerCase()} successfully`, facility });
  } catch (error) {
    console.error('Update facility status error:', error);
    res.status(500).json({ error: true, message: 'Failed to update facility status' });
  }
});

module.exports = router;
