const Student = require('../models/Student');
const asyncHandler = require('express-async-handler');

// @desc    Get all students with pagination
// @route   GET /api/student/all
// @access  Private
const getAllStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = 'name', order = 'asc', search } = req.query;
  const query = {};

  // Add search by name, email, or PRN if provided
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { rollNumber: new RegExp(search, 'i') }
    ];
  }

  // Get total count for pagination
  const total = await Student.countDocuments(query);

  // Determine sort order (1 for ascending, -1 for descending)
  const sortOrder = order.toLowerCase() === 'desc' ? -1 : 1;
  
  // Get students with pagination and sorting
  const students = await Student.find(query)
    .sort({ [sort]: sortOrder })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-password');

  res.status(200).json({
    success: true,
    data: students,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  });
});

// Export all controllers
module.exports = {
  getAllStudents,
  // ... other existing exports
}; 