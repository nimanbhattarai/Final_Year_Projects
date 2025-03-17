const express = require("express");
const {
  registerAdmin,
  loginAdmin,
  getStudents,
  updateStudentData,
  deleteStudent,
  getStudentsWithPerformance,
  getStudent
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

// Get a specific student
router.get("/student/:studentId", getStudent);

router.delete("/student/:studentId", deleteStudent);

// Add the new route for getting students with performance data
router.get('/students-with-performance', getStudentsWithPerformance);

module.exports = router;
