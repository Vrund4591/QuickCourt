const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get reviews for a facility
router.get('/facility/:facilityId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { facilityId: req.params.facilityId },
      include: {
        user: {
          select: { fullName: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate average rating
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    res.json({ 
      success: true, 
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: true, message: 'Failed to get reviews' });
  }
});

// Create review (only if user has completed booking)
router.post('/', auth, async (req, res) => {
  try {
    const { facilityId, rating, comment } = req.body;

    // Check if user has completed booking at this facility
    const completedBooking = await prisma.booking.findFirst({
      where: {
        userId: req.user.userId,
        facilityId,
        status: 'COMPLETED'
      }
    });

    if (!completedBooking) {
      return res.status(403).json({ 
        error: true, 
        message: 'You can only review facilities where you have completed bookings' 
      });
    }

    // Check if user already reviewed this facility
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: req.user.userId,
        facilityId
      }
    });

    if (existingReview) {
      return res.status(400).json({
        error: true,
        message: 'You have already reviewed this facility'
      });
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user.userId,
        facilityId,
        rating: parseInt(rating),
        comment
      },
      include: {
        user: {
          select: { fullName: true, avatar: true }
        }
      }
    });

    res.status(201).json({ success: true, message: 'Review added successfully', review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: true, message: 'Failed to create review' });
  }
});

// Update review
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id }
    });

    if (!review || review.userId !== req.user.userId) {
      return res.status(403).json({ error: true, message: 'Not authorized' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        user: {
          select: { fullName: true, avatar: true }
        }
      }
    });

    res.json({ 
      success: true, 
      message: 'Review updated successfully', 
      review: updatedReview 
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: true, message: 'Failed to update review' });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id }
    });

    if (!review || review.userId !== req.user.userId) {
      return res.status(403).json({ error: true, message: 'Not authorized' });
    }

    await prisma.review.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: true, message: 'Failed to delete review' });
  }
});

module.exports = router;
