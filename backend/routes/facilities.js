const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all approved facilities
router.get('/', async (req, res) => {
  try {
    const facilities = await prisma.facility.findMany({
      where: { 
        status: 'APPROVED',
        isActive: true 
      },
      include: {
        owner: {
          select: { fullName: true, email: true }
        },
        courts: {
          where: { isActive: true }
        },
        reviews: {
          select: { rating: true }
        }
      }
    });

    res.json({ success: true, facilities });
  } catch (error) {
    console.error('Get facilities error:', error);
    res.status(500).json({ error: true, message: 'Failed to get facilities' });
  }
});

// Get facility by ID
router.get('/:id', async (req, res) => {
  try {
    const facility = await prisma.facility.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: { fullName: true, email: true }
        },
        courts: {
          where: { isActive: true }
        },
        reviews: {
          include: {
            user: {
              select: { fullName: true, avatar: true }
            }
          }
        }
      }
    });

    if (!facility) {
      return res.status(404).json({ error: true, message: 'Facility not found' });
    }

    res.json({ success: true, facility });
  } catch (error) {
    console.error('Get facility error:', error);
    res.status(500).json({ error: true, message: 'Failed to get facility' });
  }
});

// Create facility (for facility owners)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'FACILITY_OWNER') {
      return res.status(403).json({ error: true, message: 'Only facility owners can create facilities' });
    }

    const { name, description, address, location, venueType, images, amenities } = req.body;

    const facility = await prisma.facility.create({
      data: {
        name,
        description,
        address,
        location,
        venueType,
        ownerId: req.user.userId,
        images,
        amenities,
        status: 'PENDING'
      }
    });

    res.status(201).json({ success: true, message: 'Facility created successfully', facility });
  } catch (error) {
    console.error('Create facility error:', error);
    res.status(500).json({ error: true, message: 'Failed to create facility' });
  }
});

module.exports = router;
