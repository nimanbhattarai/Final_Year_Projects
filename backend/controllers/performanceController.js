const Student = require("../models/Student");


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

    // Convert Map structure to a more frontend-friendly format for response
    const academicData = {};
    
    for (const [yr, yrData] of student.performance.academic.entries()) {
      academicData[yr] = { semester: {} };
      
      // Convert semester Map to object
      if (yrData.semester) {
        for (const [sem, subjects] of yrData.semester.entries()) {
          academicData[yr].semester[sem] = subjects;
        }
      }
    }

    res.status(200).json({ 
      message: "Academic grades updated", 
      academic: academicData 
    });
  } catch (error) {
    console.error('Error updating academic grades:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteAcademicGrades = async (req, res) => {
  const { studentId, year, semester } = req.body;
  if (!studentId || !year || !semester) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.performance.academic.has(year)) {
      // Get the year data
      const yearData = student.performance.academic.get(year);
      
      // Check if semester exists
      if (yearData.semester.has(semester)) {
        // Delete the semester
        yearData.semester.delete(semester);
        
        // If no more semesters in this year, delete the year too
        if (yearData.semester.size === 0) {
          student.performance.academic.delete(year);
        }
        
        // Mark the field as modified to ensure Mongoose saves the changes
        student.markModified('performance.academic');
        
        await student.save();
        
        // Convert Map structure to a more frontend-friendly format for response
        const academicData = {};
        
        for (const [yr, yrData] of student.performance.academic.entries()) {
          academicData[yr] = { semester: {} };
          
          // Convert semester Map to object
          if (yrData.semester) {
            for (const [sem, subjects] of yrData.semester.entries()) {
              academicData[yr].semester[sem] = subjects;
            }
          }
        }
        
        return res.status(200).json({ 
          message: "Academic grades deleted", 
          academic: academicData 
        });
      }
    }
    return res.status(404).json({ message: "No grades found for the specified year and semester" });

  } catch (error) {
    console.error('Error deleting academic grades:', error);
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
  console.log("Hii", req.body)
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

    // Convert Map structure to a more frontend-friendly format
    const studentData = student.toObject();
    
    // Process academic data if it exists
    if (student.performance && student.performance.academic) {
      // Convert the Map to a regular object
      const academicData = {};
      
      for (const [year, yearData] of student.performance.academic.entries()) {
        academicData[year] = { semester: {} };
        
        // Convert semester Map to object
        if (yearData.semester) {
          for (const [semester, subjects] of yearData.semester.entries()) {
            academicData[year].semester[semester] = subjects;
          }
        }
      }
      
      // Replace the Map with our processed object
      studentData.performance.academic = academicData;
    }

    res.status(200).json(studentData);
  } catch (error) {
    console.error('Error fetching student performance:', error);
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

    const bestStudent = students.reduce((best, student) => {
      // Calculate total score or performance metrics
      const totalScore = calculateTotalScore(student); // Ensure this function is defined and works correctly
      return totalScore > best.score ? { student, score: totalScore } : best;
    }, { student: null, score: 0 });

    res.status(200).json({
      bestStudent: {
        ...bestStudent.student.toObject(),
        photo: bestStudent.student.photo // Include photo if needed
      },
      totalScore: bestStudent.score,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Extracurricular Activity
const deleteExtracurricular = async (req, res) => {
  const { studentId, activityIndex } = req.body;
  if (!studentId || activityIndex === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if the extracurricular array exists and has the specified index
    if (!student.performance.extracurricular || 
        activityIndex >= student.performance.extracurricular.length) {
      return res.status(404).json({ message: "Activity not found" });
    }

    // Remove the activity at the specified index
    student.performance.extracurricular.splice(activityIndex, 1);
    
    // Save the updated student record
    await student.save();

    res.status(200).json({ 
      message: "Extracurricular activity deleted", 
      extracurricular: student.performance.extracurricular
    });
  } catch (error) {
    console.error('Error deleting extracurricular activity:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete Teacher Remark
const deleteTeacherRemarks = async (req, res) => {
  const { studentId, remarkIndex } = req.body;
  if (!studentId || remarkIndex === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if the teacherRemarks array exists and has the specified index
    if (!student.performance.teacherRemarks || 
        remarkIndex >= student.performance.teacherRemarks.length) {
      return res.status(404).json({ message: "Remark not found" });
    }

    // Remove the remark at the specified index
    student.performance.teacherRemarks.splice(remarkIndex, 1);
    
    // Save the updated student record
    await student.save();

    res.status(200).json({ 
      message: "Teacher remark deleted", 
      teacherRemarks: student.performance.teacherRemarks
    });
  } catch (error) {
    console.error('Error deleting teacher remark:', error);
    res.status(500).json({ message: error.message });
  }
};

const calculateTotalScore = (student) => {
  const academicScore = student.performance.academicScore || 0;
  const extracurricularScore = student.performance.extraCurricularScore || 0;
  const remarksScore = student.performance.remarksScore || 0;

  // Example weights
  const totalScore = (academicScore * 0.7) + (extracurricularScore * 0.2) + (remarksScore * 0.1);
  return Math.round(totalScore);
};

module.exports = {
  updateAcademicGrades,
  updateExtracurricularGrades,
  updateTeacherRemarks,
  getPerformance,
  getBestPerformingStudent,
  deleteAcademicGrades,
  deleteExtracurricular,
  deleteTeacherRemarks
};
