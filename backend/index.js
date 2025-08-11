// Load environment variables with proper configuration
const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('./generated/prisma');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const facilityRoutes = require('./routes/facilities');
const courtRoutes = require('./routes/courts');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');
const uploadRoutes = require('./routes/upload');
const timeSlotsRoutes = require('./routes/timeSlots');
const paymentRoutes = require('./routes/payment');
const ownerRoutes = require('./routes/owner');
const reportsRoutes = require('./routes/reports');

const app = express();
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('🔄 Retrying database connection in 5 seconds...');
    
    setTimeout(async () => {
      try {
        await prisma.$connect();
        console.log('✅ Database reconnected successfully');
      } catch (retryError) {
        console.error('❌ Database reconnection failed:', retryError.message);
        console.log('⚠️  Server will continue running, but database operations may fail');
      }
    }, 5000);
  }
}

// Initialize database connection
testDatabaseConnection();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/time-slots', timeSlotsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/reports', reportsRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'OK', 
      message: 'QuickCourt API is running',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'ERROR', 
      message: 'Service unavailable',
      database: 'Disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Database health check endpoint
app.get('/api/health/database', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const userCount = await prisma.user.count();
    res.json({ 
      status: 'Connected', 
      message: 'Database is accessible',
      userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(503).json({ 
      status: 'Disconnected', 
      message: 'Database is not accessible',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    error: true,
    message: error.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 QuickCourt API server running on port ${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});







