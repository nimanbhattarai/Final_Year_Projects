const express = require("express");
const {
  loginStudent,
  getProfile,
  academicAnalysis,
  registerStudent,
  getAcademicRecords,
  uploadPhoto,
  testCloudinaryUpload,
  dataSaving
} = require("../controllers/studentsController");
const upload = require("../middleware/uploadMiddleware");

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

router.post("/data/add", dataSaving);

module.exports = router;
