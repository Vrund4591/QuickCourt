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

    // Validate required fields
    if (!name || !sportType || !pricePerHour || !facilityId) {
      return res.status(400).json({ 
        error: true, 
        message: 'Name, sport type, price per hour, and facility ID are required' 
      });
    }

    // Verify facility ownership
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId }
    });

    if (!facility) {
      return res.status(404).json({ error: true, message: 'Facility not found' });
    }

    if (facility.ownerId !== req.user.userId) {
      return res.status(403).json({ error: true, message: 'Not authorized to add courts to this facility' });
    }

    // Check if court name already exists in this facility
    const existingCourt = await prisma.court.findFirst({
      where: {
        facilityId,
        name: name.trim(),
        isActive: true
      }
    });

    if (existingCourt) {
      return res.status(400).json({ 
        error: true, 
        message: 'A court with this name already exists in this facility' 
      });
    }

    const court = await prisma.court.create({
      data: {
        name: name.trim(),
        sportType,
        pricePerHour: parseFloat(pricePerHour),
        facilityId,
        isActive: true
      },
      include: {
        facility: {
          select: { name: true }
        }
      }
    });

    res.status(201).json({ success: true, message: 'Court created successfully', court });
  } catch (error) {
    console.error('Create court error:', error);
    res.status(500).json({ error: true, message: 'Failed to create court' });
  }
});

// Update court
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, sportType, pricePerHour } = req.body;

    // Get court with facility info
    const court = await prisma.court.findUnique({
      where: { id: req.params.id },
      include: { facility: true }
    });

    if (!court) {
      return res.status(404).json({ error: true, message: 'Court not found' });
    }

    if (court.facility.ownerId !== req.user.userId) {
      return res.status(403).json({ error: true, message: 'Not authorized to update this court' });
    }

    // Check for duplicate names in the same facility (excluding current court)
    if (name && name !== court.name) {
      const existingCourt = await prisma.court.findFirst({
        where: {
          facilityId: court.facilityId,
          name,
          isActive: true,
          id: { not: req.params.id }
        }
      });

      if (existingCourt) {
        return res.status(400).json({ 
          error: true, 
          message: 'A court with this name already exists in this facility' 
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (sportType !== undefined) updateData.sportType = sportType;
    if (pricePerHour !== undefined) updateData.pricePerHour = parseFloat(pricePerHour);

    const updatedCourt = await prisma.court.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        facility: {
          select: { name: true }
        }
      }
    });

    res.json({ 
      success: true, 
      message: 'Court updated successfully', 
      court: updatedCourt 
    });
  } catch (error) {
    console.error('Update court error:', error);
    res.status(500).json({ error: true, message: 'Failed to update court' });
  }
});

// Delete court (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const court = await prisma.court.findUnique({
      where: { id: req.params.id },
      include: { facility: true }
    });

    if (!court) {
      return res.status(404).json({ error: true, message: 'Court not found' });
    }

    if (court.facility.ownerId !== req.user.userId) {
      return res.status(403).json({ error: true, message: 'Not authorized to delete this court' });
    }

    // Check for future bookings
    const futureBookings = await prisma.booking.findMany({
      where: {
        courtId: req.params.id,
        bookingDate: {
          gte: new Date()
        },
        status: { in: ['CONFIRMED', 'PENDING'] }
      }
    });

    if (futureBookings.length > 0) {
      return res.status(400).json({ 
        error: true, 
        message: `Cannot delete court with ${futureBookings.length} future booking(s). Please cancel them first.` 
      });
    }

    // Soft delete
    await prisma.court.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json({ success: true, message: 'Court deleted successfully' });
  } catch (error) {
    console.error('Delete court error:', error);
    res.status(500).json({ error: true, message: 'Failed to delete court' });
  }
});

module.exports = router;
