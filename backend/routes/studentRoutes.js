const express = require("express");
const {
  loginStudent,
  getProfile,
  academicAnalysis,
  registerStudent,
} = require("../controllers/studentsController");

const router = express.Router();

// Student Login
router.post("/login", loginStudent);

// Student Register
router.post("/register", registerStudent);

// Get Student Profile
router.get("/:studentId/profile", getProfile);

// Academic Analysis
router.get("/:studentId/analysis", academicAnalysis);

module.exports = router;
