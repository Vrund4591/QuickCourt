const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          isActive: true
        }
      });

      if (!user) {
        return res.status(401).json({ message: 'Invalid token. User not found.' });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is inactive.' });
      }

      req.user = {
        userId: user.id,
        ...user
      };
      next();
    } catch (dbError) {
      console.error('Database error in auth middleware:', dbError);
      
      // If it's a connection error, try to reconnect
      if (dbError.code === 'P1001' || dbError.message.includes("Can't reach database")) {
        console.log('🔄 Attempting to reconnect to database...');
        try {
          await prisma.$connect();
          console.log('✅ Database reconnected in auth middleware');
          
          // Retry the user query
          const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              isActive: true
            }
          });

          if (!user) {
            return res.status(401).json({ message: 'Invalid token. User not found.' });
          }

          if (!user.isActive) {
            return res.status(401).json({ message: 'Account is inactive.' });
          }

          req.user = user;
          next();
        } catch (reconnectError) {
          console.error('❌ Failed to reconnect to database:', reconnectError);
          return res.status(503).json({ 
            message: 'Database temporarily unavailable. Please try again later.' 
          });
        }
      } else {
        return res.status(500).json({ message: 'Internal server error.' });
      }
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = auth;
