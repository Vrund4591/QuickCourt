const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get owner's facilities - MUST be before /:id route
router.get('/owner', auth, async (req, res) => {
  try {
    if (req.user.role !== 'FACILITY_OWNER') {
      return res.status(403).json({ error: true, message: 'Only facility owners can access this' });
    }

    const facilities = await prisma.facility.findMany({
      where: { ownerId: req.user.userId },
      include: {
        courts: {
          where: { isActive: true }
        },
        _count: {
          select: {
            bookings: {
              where: { status: 'CONFIRMED' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, facilities });
  } catch (error) {
    console.error('Get owner facilities error:', error);
    res.status(500).json({ error: true, message: 'Failed to get facilities' });
  }
});

// Get all approved facilities with enhanced filtering
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      sportType, 
      venueType, 
      priceRange, 
      rating,
      page = 1, 
      limit = 12 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const where = {
      status: 'APPROVED',
      isActive: true
    };

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Add venue type filter
    if (venueType) {
      where.venueType = venueType;
    }

    const facilities = await prisma.facility.findMany({
      where,
      include: {
        owner: {
          select: { fullName: true, email: true }
        },
        courts: {
          where: { 
            isActive: true,
            ...(sportType && { sportType })
          }
        },
        reviews: {
          select: { rating: true }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    // Filter by sport type (if courts with that sport exist)
    let filteredFacilities = facilities;
    if (sportType) {
      filteredFacilities = facilities.filter(facility => 
        facility.courts.some(court => court.sportType === sportType)
      );
    }

    // Filter by price range
    if (priceRange) {
      const [min, max] = priceRange.includes('+') 
        ? [parseInt(priceRange.replace('+', '')), Infinity]
        : priceRange.split('-').map(p => parseInt(p));
      
      filteredFacilities = filteredFacilities.filter(facility => {
        const minPrice = Math.min(...facility.courts.map(court => court.pricePerHour));
        return minPrice >= min && (max === Infinity || minPrice <= max);
      });
    }

    // Filter by rating
    if (rating) {
      const minRating = parseFloat(rating);
      filteredFacilities = filteredFacilities.filter(facility => {
        if (!facility.reviews || facility.reviews.length === 0) return false;
        const avgRating = facility.reviews.reduce((sum, review) => sum + review.rating, 0) / facility.reviews.length;
        return avgRating >= minRating;
      });
    }

    // Get total count for pagination
    const totalCount = await prisma.facility.count({ where });

    res.json({ 
      success: true, 
      facilities: filteredFacilities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: skip + filteredFacilities.length < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get facilities error:', error);
    res.status(500).json({ error: true, message: 'Failed to get facilities' });
  }
});

// Get facility by ID
router.get('/:id', async (req, res) => {
  try {
    const facility = await prisma.facility.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: { fullName: true, email: true }
        },
        courts: {
          where: { isActive: true }
        },
        reviews: {
          include: {
            user: {
              select: { fullName: true, avatar: true }
            }
          }
        }
      }
    });

    if (!facility) {
      return res.status(404).json({ error: true, message: 'Facility not found' });
    }

    res.json({ success: true, facility });
  } catch (error) {
    console.error('Get facility error:', error);
    res.status(500).json({ error: true, message: 'Failed to get facility' });
  }
});

// Create facility (for facility owners)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'FACILITY_OWNER') {
      return res.status(403).json({ error: true, message: 'Only facility owners can create facilities' });
    }

    const { name, description, address, location, venueType, images, amenities } = req.body;

    // Validate required fields
    if (!name || !description || !address || !venueType) {
      return res.status(400).json({ 
        error: true, 
        message: 'Name, description, address, and venue type are required' 
      });
    }

    const facility = await prisma.facility.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        address: address.trim(),
        location: location || address.trim(),
        venueType,
        ownerId: req.user.userId,
        images: images || [],
        amenities: amenities || [],
        status: 'PENDING',
        isActive: true
      },
      include: {
        courts: {
          where: { isActive: true }
        }
      }
    });

    res.status(201).json({ success: true, message: 'Facility created successfully', facility });
  } catch (error) {
    console.error('Create facility error:', error);
    res.status(500).json({ error: true, message: 'Failed to create facility' });
  }
});

module.exports = router;
