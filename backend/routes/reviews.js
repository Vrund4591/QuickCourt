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

    res.json({ success: true, reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: true, message: 'Failed to get reviews' });
  }
});

// Create review
router.post('/', auth, async (req, res) => {
  try {
    const { facilityId, rating, comment } = req.body;

    // Check if user has already reviewed this facility
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: req.user.userId,
        facilityId
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: true, message: 'You have already reviewed this facility' });
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user.userId,
        facilityId,
        rating,
        comment
      }
    });

    res.status(201).json({ success: true, message: 'Review created successfully', review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: true, message: 'Failed to create review' });
  }
});

module.exports = router;
