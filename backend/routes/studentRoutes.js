const express = require("express");
const {
  loginStudent,
  getProfile,
  academicAnalysis,
  registerStudent,
  getAcademicRecords,
  uploadPhoto,
  testCloudinaryUpload,
  dataSaving,
  forgotPassword,
  resetPassword,
  uploadProfilePhoto
} = require("../controllers/studentsController");
const upload = require("../middleware/uploadMiddleware");
const { getAllStudents } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Student Login
router.post("/login", loginStudent);

// Student Register - add upload middleware
router.post("/register", upload.single('photo'), registerStudent);

// Get Student Profile
router.get("/:studentId/profile", getProfile);

// Academic Analysis
router.get("/:studentId/analysis", academicAnalysis);

// Academic Records
router.get("/:studentId/academic", getAcademicRecords);

// Photo upload route for existing students
router.post("/:studentId/photo", upload.single('photo'), uploadPhoto);

// Test upload route
router.post("/test-upload", upload.single('photo'), testCloudinaryUpload);

// Data saving route
router.post("/data/add", dataSaving);

// Forgot password route
router.post("/forgot-password", forgotPassword);

// Reset password route
router.post("/reset-password/:token", resetPassword);

// Upload profile photo after login
router.post("/upload-profile-photo", upload.single('photo'), uploadProfilePhoto);

// Get all students (protected route)
router.get('/all', protect, getAllStudents);

module.exports = router;
