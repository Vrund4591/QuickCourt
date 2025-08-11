const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Submit report
router.post('/', auth, async (req, res) => {
  try {
    const { type, targetId, reason, description } = req.body;

    // Validate report type
    if (!['FACILITY', 'USER', 'REVIEW'].includes(type)) {
      return res.status(400).json({ error: true, message: 'Invalid report type' });
    }

    const report = await prisma.report.create({
      data: {
        userId: req.user.userId,
        type,
        targetId,
        reason,
        description,
        status: 'PENDING'
      }
    });

    res.status(201).json({ 
      success: true, 
      message: 'Report submitted successfully', 
      report 
    });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ error: true, message: 'Failed to submit report' });
  }
});

// Get all reports (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: true, message: 'Admin access required' });
    }

    const { status, type, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const reports = await prisma.report.findMany({
      where,
      include: {
        user: {
          select: { fullName: true, email: true }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const totalCount = await prisma.report.count({ where });

    res.json({ 
      success: true, 
      reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: true, message: 'Failed to get reports' });
  }
});

// Update report status (admin only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: true, message: 'Admin access required' });
    }

    const { status, adminNotes } = req.body;

    if (!['PENDING', 'RESOLVED', 'DISMISSED'].includes(status)) {
      return res.status(400).json({ error: true, message: 'Invalid status' });
    }

    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: {
        status,
        adminNotes,
        resolvedAt: status === 'RESOLVED' ? new Date() : null,
        resolvedBy: status === 'RESOLVED' ? req.user.userId : null
      }
    });

    res.json({ 
      success: true, 
      message: `Report ${status.toLowerCase()} successfully`, 
      report 
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ error: true, message: 'Failed to update report status' });
  }
});

module.exports = router;
