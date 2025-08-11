const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();
const prisma = new PrismaClient();

// Get all users (Admin only)
router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Handle specific database connection errors
    if (error.code === 'P1001' || error.message.includes("Can't reach database")) {
      return res.status(503).json({ 
        message: 'Database temporarily unavailable. Please try again later.',
        error: 'DATABASE_CONNECTION_ERROR'
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user (Admin only)
router.post('/users', auth, admin, async (req, res) => {
  try {
    const { name, email, phone, role, status, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName: name,
        email,
        phone,
        role: role || 'USER',
        isActive: status === 'ACTIVE' ? true : false,
        password: hashedPassword,
        isVerified: true
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(201).json({ 
      message: 'User created successfully',
      user 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (Admin only)
router.put('/users/:id', auth, admin, async (req, res) => {
  try {
    const { name, email, phone, role, status } = req.body;
    const userId = req.params.id;
    
    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: userId
        }
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email already taken' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: name,
        email,
        phone,
        role,
        isActive: status === 'ACTIVE' ? true : false
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ 
      message: 'User updated successfully',
      user 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (Admin only)
router.delete('/users/:id', auth, admin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user status (Admin only)
router.patch('/users/:id/status', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.params.id;
    
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: status === 'ACTIVE' ? true : false },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ 
      message: `User ${status.toLowerCase()} successfully`,
      user 
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID (Admin only)
router.get('/users/:id', auth, admin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard stats (Admin only)
router.get('/stats', auth, admin, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { isActive: true }
    });
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    });
    const ownerCount = await prisma.user.count({
      where: { role: 'OWNER' }
    });
    const userCount = await prisma.user.count({
      where: { role: 'USER' }
    });
    
    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      adminCount,
      ownerCount,
      userCount,
      recentUsers
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset user password (Admin only)
router.patch('/users/:id/reset-password', auth, admin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.params.id;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ 
      message: 'Password reset successfully',
      user 
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
