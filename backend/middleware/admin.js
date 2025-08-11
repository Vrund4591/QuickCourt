const admin = (req, res, next) => {
  // Check if user role is admin
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

module.exports = admin;