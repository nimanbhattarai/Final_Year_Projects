const express = require("express");
const {
  registerAdmin,
  loginAdmin,
  getStudents,
  updateStudentData,
} = require("../controllers/adminController");
const router = express.Router();

// Register Admin
router.post("/register", registerAdmin);

// Login Admin
router.post("/login", loginAdmin);

// Get All Students
router.get("/students", getStudents);

// Update Student Data
router.put("/student/update", updateStudentData);

module.exports = router;
