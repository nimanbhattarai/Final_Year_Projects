const express = require("express");
const multer = require('multer');
const path = require('path');
const {
  registerAdmin,
  loginAdmin,
  getStudents,
  updateStudentData,
  deleteStudent,
  getStudentsWithPerformance,
  getStudent,
  getTeachers,
  deleteTeacher,
  addStudent
} = require("../controllers/adminController");
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/students');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Register Admin
router.post("/register", registerAdmin);

// Login Admin
router.post("/login", loginAdmin);

// Add new student with photo upload
router.post("/student/add", upload.single('photo'), addStudent);

// Get All Students
router.get("/students", getStudents);

// Update Student Data
router.put("/student/update", updateStudentData);

// Get a specific student
router.get("/student/:studentId", getStudent);

// Delete student
router.delete("/student/:studentId", deleteStudent);

// Get students with performance data
router.get('/students-with-performance', getStudentsWithPerformance);

// Teacher management routes
router.get('/teachers', getTeachers);
router.delete('/teacher/:teacherId', deleteTeacher);

module.exports = router;
