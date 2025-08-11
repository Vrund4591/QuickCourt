const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../generated/prisma');
const { sendOTPEmail } = require('../utils/email');
const { generateOTP } = require('../utils/helpers');
const { body, validationResult } = require('express-validator');

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

    // For development, log the OTP instead of sending email
    if (process.env.NODE_ENV === 'development') {
      console.log(`OTP for ${email}: ${otp}`);
    } else {
      await sendOTPEmail(email, otp, fullName);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email with OTP',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
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
        phone: true,
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

module.exports = router;
