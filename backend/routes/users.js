const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('Profile request - User ID from auth:', req.user?.userId);
    
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: true, message: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { 
        id: true, 
        email: true, 
        fullName: true, 
        role: true, 
        avatar: true, 
        phone: true,
        isVerified: true,
        isActive: true,
        createdAt: true 
      }
    });

    console.log('Found user:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    // Ensure all fields have default values if they don't exist in the schema
    const userResponse = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatar: user.avatar || null,
      phone: user.phone || null,
      isVerified: user.isVerified !== undefined ? user.isVerified : true,
      isActive: user.isActive !== undefined ? user.isActive : true,
      createdAt: user.createdAt
    };

    res.json({ success: true, user: userResponse });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: true, message: 'Failed to get profile', details: error.message });
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
