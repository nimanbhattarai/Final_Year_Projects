const Student = require("../models/Student");

// Add or Update Academic Grades
const updateAcademicGrades = async (req, res) => {
  const { studentId, year, semester, grades } = req.body;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Ensure academic record exists
    if (!student.performance.academic) {
      student.performance.academic = new Map();
    }

    // Ensure the year exists
    if (!student.performance.academic.has(year)) {
      student.performance.academic.set(year, { semester: new Map() });
    }

    // Get the year record
    let yearData = student.performance.academic.get(year);

    // Ensure semester exists
    if (!yearData.semester.has(semester)) {
      yearData.semester.set(semester, []);
    }

    // Update grades for the semester
    yearData.semester.set(semester, grades);

    // Save the updated student record
    await student.save();

    res.status(200).json({ message: "Academic grades updated", academic: student.performance.academic });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add or Update Extracurricular Grades
const updateExtracurricularGrades = async (req, res) => {
  const { studentId, activity, grade } = req.body;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update extracurricular grades
    student.performance.extracurricular.push({ activity, grade });
    await student.save();

    res.status(200).json({ message: "Extracurricular grades updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add or Update Teacher Remarks
const updateTeacherRemarks = async (req, res) => {
  const { studentId, teacherName, remark, grade } = req.body;
console.log("Hii",req.body)
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update teacher remarks
    student.performance.teacherRemarks.push({ teacherName, remark, grade });
    await student.save();

    res.status(200).json({ message: "Teacher remarks updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Performance Data for a Student
const getPerformance = async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Best Performing Student
const getBestPerformingStudent = async (req, res) => {
  try {
    const students = await Student.find();
    if (!students.length) {
      return res.status(404).json({ message: "No students found" });
    }

    // Analyze performance
    const bestStudent = students.reduce((best, student) => {
      const totalAcademic = Object.values(student.performance.academic || {})
        .flatMap((year) => Object.values(year))
        .reduce((sum, grades) => {
          // Ensure grades is an array before calling reduce
          if (Array.isArray(grades)) {
            return sum + grades.reduce((a, b) => a + b, 0);
          }
          return sum;
        }, 0);

      const totalExtraCurricular = (student.performance.extracurricular || []).reduce(
        (sum, activity) => sum + (activity.grade || 0),
        0
      );

      const totalTeacherRemarks = (student.performance.teacherRemarks || []).reduce(
        (sum, remark) => sum + (remark.grade || 0),
        0
      );

      const totalScore = totalAcademic + totalExtraCurricular + totalTeacherRemarks;

      return totalScore > best.score ? { student, score: totalScore } : best;
    }, { student: null, score: 0 });

    res.status(200).json({
      bestStudent: bestStudent.student,
      totalScore: bestStudent.score,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  updateAcademicGrades,
  updateExtracurricularGrades,
  updateTeacherRemarks,
  getPerformance,
  getBestPerformingStudent,
};
