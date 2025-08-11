const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, fullName: true, role: true, avatar: true, createdAt: true }
    });

    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: true, message: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, avatar } = req.body;

    // Validate input
    if (fullName && fullName.trim().length < 2) {
      return res.status(400).json({ error: true, message: 'Full name must be at least 2 characters' });
    }

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName.trim();
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: { 
        id: true, 
        email: true, 
        fullName: true, 
        role: true, 
        avatar: true, 
        isVerified: true,
        isActive: true,
        createdAt: true
      }
    });

    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: true, message: 'Failed to update profile' });
  }
});

module.exports = router;
