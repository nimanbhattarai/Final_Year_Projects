const express = require("express");
const {
  updateAcademicGrades,
  updateExtracurricularGrades,
  updateTeacherRemarks,
  getPerformance,
  getBestPerformingStudent,
} = require("../controllers/performanceController");

const router = express.Router();

// Academic Grades
router.put("/academic", updateAcademicGrades);

// Extracurricular Grades
router.put("/extracurricular", updateExtracurricularGrades);

// Teacher Remarks
router.put("/teacher-remarks", updateTeacherRemarks);
// Get Best Performing Student
router.get("/best-performing", getBestPerformingStudent);

// Get Performance Data
router.get("/:studentId", getPerformance);



module.exports = router;
