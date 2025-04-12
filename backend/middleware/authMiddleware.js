const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user is a teacher
      let user = await Teacher.findById(decoded.id).select('-password');
      
      // If not a teacher, check if user is a student
      if (!user) {
        user = await Student.findById(decoded.id).select('-password');
      }

      // If no user found
      if (!user) {
        res.status(401);
        throw new Error('Not authorized');
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

module.exports = { protect };
