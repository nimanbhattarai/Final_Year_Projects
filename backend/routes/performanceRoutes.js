const express = require("express");
const {
  updateAcademicGrades,
  updateExtracurricularGrades,
  updateTeacherRemarks,
  getPerformance,
  getBestPerformingStudent,
  deleteAcademicGrades,
  deleteExtracurricular,
  deleteTeacherRemarks,
  getAllStudentsPerformance
} = require("../controllers/performanceController");

const router = express.Router();

// Academic Grades
router.put("/academic", updateAcademicGrades);
router.delete("/academic", deleteAcademicGrades);

// Extracurricular Grades
router.put("/extracurricular", updateExtracurricularGrades);
router.delete("/extracurricular", deleteExtracurricular);

// Teacher Remarks
router.put("/teacher-remarks", updateTeacherRemarks);
router.delete("/teacher-remarks", deleteTeacherRemarks);

// Get All Students Performance
router.get("/students/all", getAllStudentsPerformance);

// Get Best Performing Student
router.get("/best-performing", getBestPerformingStudent);

// Get Performance Data
router.get("/:studentId", getPerformance);

module.exports = router;
