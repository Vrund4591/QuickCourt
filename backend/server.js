const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

// Import routes
const authRoutes = require('./routes/auth');
const facilityRoutes = require('./routes/facilities');
const bookingRoutes = require('./routes/bookings');
const courtRoutes = require('./routes/courts');
const timeSlotRoutes = require('./routes/timeSlots');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const ownerRoutes = require('./routes/owner');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/time-slots', timeSlotRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/owner', ownerRoutes);

// Debug route to check specific facility
app.get('/api/debug/facility/:id', async (req, res) => {
  try {
    const { PrismaClient } = require('./generated/prisma');
    const prisma = new PrismaClient();
    
    const facility = await prisma.facility.findUnique({
      where: { id: req.params.id },
      include: {
        courts: true,
        owner: true
      }
    });
    
    res.json({ facility });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;