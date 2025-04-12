const express = require('express');
const router = express.Router();
const { registerTeacher, loginTeacher, getTeacherProfile, addTeacherRemark, getTeacherRemarks, deleteTeacherRemark, forgotPassword, resetPassword } = require('../controllers/teacherController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerTeacher);
router.post('/login', loginTeacher);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/profile', protect, getTeacherProfile);

// Teacher Remarks routes
router.post('/remarks/:studentId', protect, addTeacherRemark);
router.get('/remarks/:studentId', protect, getTeacherRemarks);
router.delete('/remarks/:studentId/:remarkIndex', protect, deleteTeacherRemark);

module.exports = router; 