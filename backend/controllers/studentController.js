const Student = require('../models/Student');
const asyncHandler = require('express-async-handler');

// @desc    Get all students
// @route   GET /api/student/all
// @access  Private
const getAllStudents = asyncHandler(async (req, res) => {
  const students = await Student.find({}).select('-password');
  res.status(200).json({
    success: true,
    data: students
  });
});

// Export all controllers
module.exports = {
  getAllStudents,
  // ... other existing exports
}; 