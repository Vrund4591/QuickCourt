const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: true, message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true, isVerified: true }
    });

    if (!user) {
      return res.status(401).json({ error: true, message: 'Invalid token. User not found.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: true, message: 'Account is deactivated.' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: true, message: 'Email not verified.' });
    }

    req.user = { userId: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: true, message: 'Invalid token.' });
  }
};

module.exports = auth;
