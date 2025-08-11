const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all facilities (public)
router.get('/', async (req, res) => {
  try {
    const facilities = await prisma.facility.findMany({
      include: {
        courts: true,
        owner: {
          select: {
            fullName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, facilities });
  } catch (error) {
    console.error('Get facilities error:', error);
    res.status(500).json({ error: true, message: 'Failed to get facilities' });
  }
});

// Get owner's facilities
router.get('/my-facilities', auth, async (req, res) => {
  try {
    if (req.user.role !== 'FACILITY_OWNER') {
      return res.status(403).json({ error: true, message: 'Only facility owners can access this' });
    }

    const facilities = await prisma.facility.findMany({
      where: { ownerId: req.user.userId },
      include: {
        courts: {
          select: {
            id: true,
            name: true,
            sportType: true,
            pricePerHour: true
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, facilities });
  } catch (error) {
    console.error('Get owner facilities error:', error);
    res.status(500).json({ error: true, message: 'Failed to get facilities' });
  }
});

// Get facility by ID
router.get('/:id', async (req, res) => {
  try {
    const facility = await prisma.facility.findUnique({
      where: { id: req.params.id },
      include: {
        courts: true,
        owner: {
          select: {
            fullName: true,
            email: true,
            phone: true
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

// Create new facility
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'FACILITY_OWNER') {
      return res.status(403).json({ error: true, message: 'Only facility owners can create facilities' });
    }

    const { name, address, phone, email, description } = req.body;

    if (!name || !address) {
      return res.status(400).json({ error: true, message: 'Name and address are required' });
    }

    const facility = await prisma.facility.create({
      data: {
        name,
        // address,
        phone,
        email,
        description,
        ownerId: req.user.userId
      },
      include: {
        courts: true
      }
    });

    res.status(201).json({ success: true, facility, message: 'Facility created successfully' });
  } catch (error) {
    console.error('Create facility error:', error);
    res.status(500).json({ error: true, message: 'Failed to create facility' });
  }
});

// Update facility
router.put('/:id', auth, async (req, res) => {
  try {
    const facility = await prisma.facility.findUnique({
      where: { id: req.params.id }
    });

    if (!facility) {
      return res.status(404).json({ error: true, message: 'Facility not found' });
    }

    if (facility.ownerId !== req.user.userId) {
      return res.status(403).json({ error: true, message: 'Not authorized to update this facility' });
    }

    const { name, address, phone, email, description } = req.body;

    const updatedFacility = await prisma.facility.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(phone && { phone }),
        ...(email && { email }),
        ...(description && { description })
      },
      include: {
        courts: true
      }
    });

    res.json({ success: true, facility: updatedFacility, message: 'Facility updated successfully' });
  } catch (error) {
    console.error('Update facility error:', error);
    res.status(500).json({ error: true, message: 'Failed to update facility' });
  }
});

// Delete facility
router.delete('/:id', auth, async (req, res) => {
  try {
    const facility = await prisma.facility.findUnique({
      where: { id: req.params.id }
    });

    if (!facility) {
      return res.status(404).json({ error: true, message: 'Facility not found' });
    }

    if (facility.ownerId !== req.user.userId) {
      return res.status(403).json({ error: true, message: 'Not authorized to delete this facility' });
    }

    await prisma.facility.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, message: 'Facility deleted successfully' });
  } catch (error) {
    console.error('Delete facility error:', error);
    res.status(500).json({ error: true, message: 'Failed to delete facility' });
  }
});

module.exports = router;
