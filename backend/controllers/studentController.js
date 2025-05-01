const Student = require('../models/Student');
const asyncHandler = require('express-async-handler');

// @desc    Get all students with pagination
// @route   GET /api/student/all
// @access  Private
const getAllStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = 'name', search } = req.query;
  const query = {};

  // Add search by name, email, or PRN if provided
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { prn: new RegExp(search, 'i') }
    ];
  }

  // Get total count for pagination
  const total = await Student.countDocuments(query);

  // Get students with pagination and sorting
  const students = await Student.find(query)
    .sort({ [sort]: 1 })
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