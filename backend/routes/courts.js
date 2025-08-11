const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get courts by facility ID
router.get('/facility/:facilityId', async (req, res) => {
  try {
    const courts = await prisma.court.findMany({
      where: { 
        facilityId: req.params.facilityId,
        isActive: true 
      }
    });

    res.json({ success: true, courts });
  } catch (error) {
    console.error('Get courts error:', error);
    res.status(500).json({ error: true, message: 'Failed to get courts' });
  }
});

// Create court (for facility owners)
router.post('/', auth, async (req, res) => {
  try {
    const { name, sportType, pricePerHour, facilityId } = req.body;

    // Verify facility ownership
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId }
    });

    if (!facility || facility.ownerId !== req.user.userId) {
      return res.status(403).json({ error: true, message: 'Not authorized' });
    }

    const court = await prisma.court.create({
      data: {
        name,
        sportType,
        pricePerHour,
        facilityId
      }
    });

    res.status(201).json({ success: true, message: 'Court created successfully', court });
  } catch (error) {
    console.error('Create court error:', error);
    res.status(500).json({ error: true, message: 'Failed to create court' });
  }
});

module.exports = router;
