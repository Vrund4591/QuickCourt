const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../generated/prisma');
const { sendOTPEmail } = require('../utils/email');
const { generateOTP } = require('../utils/helpers');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRE 
  });
};

// Register (fix the route name to match frontend)
router.post('/signup', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').isLength({ min: 2 }),
  body('role').isIn(['USER', 'FACILITY_OWNER'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: true, errors: errors.array() });
    }

    const { email, password, fullName, role, avatar } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: true, message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role,
        avatar,
        isVerified: false
      }
    });

    // Generate and send OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRE_MINUTES || 10) * 60 * 1000);

    await prisma.otpVerification.create({
      data: {
        userId: user.id,
        email,
        otp,
        expiresAt
      }
    });

    // Send OTP email with better error handling
    try {
      const emailResult = await sendOTPEmail(email, otp, fullName);
      
      const message = emailResult.mode === 'development' || emailResult.mode === 'development-fallback'
        ? 'User registered successfully. Check console for OTP (development mode)'
        : 'User registered successfully. Please verify your email with OTP';

      res.status(201).json({
        success: true,
        message,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        },
        emailSent: emailResult.success,
        emailMode: emailResult.mode
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      
      // Still return success but indicate email issue
      res.status(201).json({
        success: true,
        message: 'User registered successfully, but email sending failed. Please contact support.',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        },
        emailSent: false,
        emailError: emailError.message
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: true, message: 'Registration failed' });
  }
});

// Verify OTP (fix to work with email instead of userId)
router.post('/verify-otp', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: true, errors: errors.array() });
    }

    const { email, otp } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        userId: user.id,
        otp,
        isUsed: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: true, message: 'Invalid or expired OTP' });
    }

    // Mark OTP as used and user as verified
    await prisma.$transaction([
      prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { isUsed: true }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true }
      })
    ]);

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
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

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: updatedUser
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: true, message: 'OTP verification failed' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: true, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: true, message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ error: true, message: 'Please verify your email first' });
    }

    if (!user.isActive) {
      return res.status(400).json({ error: true, message: 'Account is deactivated' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: true, message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: true, message: 'Login failed' });
  }
});

// Resend OTP
router.post('/resend-otp', [
  body('userId').notEmpty()
], async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: true, message: 'User already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRE_MINUTES) * 60 * 1000);

    await prisma.otpVerification.create({
      data: {
        userId,
        email: user.email,
        otp,
        expiresAt
      }
    });

    await sendOTPEmail(user.email, otp, user.fullName);

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: true, message: 'Failed to resend OTP' });
  }
});

// Keep the existing /register route for backward compatibility
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').isLength({ min: 2 }),
  body('role').isIn(['USER', 'FACILITY_OWNER'])
], async (req, res) => {
  // Redirect to signup endpoint
  req.url = '/signup';
  return router.handle(req, res);
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
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
    const { fullName, email, phone, address, currentPassword, newPassword } = req.body;

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!currentUser) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    // If email is being changed, check if it's already in use
    if (email && email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ error: true, message: 'Email already in use' });
      }
    }

    // Prepare update data
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    // Handle password change if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: true, message: 'Current password is required' });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, currentUser.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: true, message: 'Current password is incorrect' });
      }

      // Hash new password
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(newPassword, saltRounds);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true
      }
    });

    res.json({ success: true, user: updatedUser, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: true, message: 'Failed to update profile' });
  }
});

module.exports = router;
