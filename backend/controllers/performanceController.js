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
  
  if (!studentId || !remark || grade === undefined) {
    return res.status(400).json({ message: "Please provide student ID, remark and grade" });
  }
  
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update teacher remarks
    student.performance.teacherRemarks.push({ 
      teacherName: teacherName || '', // Make teacherName optional with default empty string
      remark, 
      grade 
    });
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

// Helper function to calculate total score
const calculateTotalScore = (student) => {
  let academicScore = 0;
  let extracurricularScore = 0;
  let remarksScore = 0;

  // Calculate academic score
  if (student.performance && student.performance.academic) {
    let totalMarks = 0;
    let totalSubjects = 0;

    for (const [_, yearData] of student.performance.academic.entries()) {
      if (yearData.semester) {
        for (const [__, subjects] of yearData.semester.entries()) {
          if (Array.isArray(subjects)) {
            for (const subject of subjects) {
              if (subject && typeof subject.marks === 'number') {
                // Convert to SGPA scale if needed
                const marks = parseFloat(subject.marks);
                totalMarks += marks > 10 ? marks / 10 : marks;
                totalSubjects++;
              }
            }
          }
        }
      }
    }

    academicScore = totalSubjects > 0 ? parseFloat((totalMarks / totalSubjects).toFixed(2)) : 0;
  }

  // Calculate extracurricular score (already in 0-10 scale)
  if (student.performance && student.performance.extracurricular && student.performance.extracurricular.length > 0) {
    const activities = student.performance.extracurricular;
    const totalGrade = activities.reduce((sum, activity) => {
      const grade = parseFloat(activity.grade || 0);
      return sum + (grade > 10 ? grade / 10 : grade); // Convert if needed, but should be 0-10 already
    }, 0);
    
    extracurricularScore = activities.length > 0 ? 
      parseFloat((totalGrade / activities.length).toFixed(2)) : 0;
  }

  // Calculate teacher remarks score (already in 0-10 scale)
  if (student.performance && student.performance.teacherRemarks && student.performance.teacherRemarks.length > 0) {
    const remarks = student.performance.teacherRemarks;
    const totalGrade = remarks.reduce((sum, remark) => {
      const grade = parseFloat(remark.grade || 0);
      return sum + (grade > 10 ? grade / 10 : grade); // Convert if needed, but should be 0-10 already
    }, 0);
    
    remarksScore = remarks.length > 0 ? 
      parseFloat((totalGrade / remarks.length).toFixed(2)) : 0;
  }

  // Calculate weighted score (70% academic, 20% extracurricular, 10% remarks)
  // Return final score on SGPA scale 0-10
  return parseFloat(
    ((academicScore * 0.7) + (extracurricularScore * 0.2) + (remarksScore * 0.1)).toFixed(2)
  );
};

// Get Best Performing Student
const getBestPerformingStudent = async (req, res) => {
  try {
    const students = await Student.find();
    if (!students.length) {
      return res.status(404).json({ message: "No students found" });
    }

    // Calculate scores for all students
    const studentsWithScores = students.map(student => {
      // Calculate academic scores
      let academicScore = 0;
      let extracurricularScore = 0;
      let remarksScore = 0;
      
      // Calculate academic score
      if (student.performance && student.performance.academic) {
        let totalMarks = 0;
        let totalSubjects = 0;

        for (const [_, yearData] of student.performance.academic.entries()) {
          if (yearData.semester) {
            for (const [__, subjects] of yearData.semester.entries()) {
              if (Array.isArray(subjects)) {
                for (const subject of subjects) {
                  if (subject && typeof subject.marks === 'number') {
                    // Convert to SGPA scale if needed
                    const marks = parseFloat(subject.marks);
                    totalMarks += marks > 10 ? marks / 10 : marks;
                    totalSubjects++;
                  }
                }
              }
            }
          }
        }

        academicScore = totalSubjects > 0 ? parseFloat((totalMarks / totalSubjects).toFixed(2)) : 0;
      }

      // Calculate extracurricular score (already in 0-10 scale)
      if (student.performance && student.performance.extracurricular && student.performance.extracurricular.length > 0) {
        const activities = student.performance.extracurricular;
        const totalGrade = activities.reduce((sum, activity) => {
          const grade = parseFloat(activity.grade || 0);
          return sum + (grade > 10 ? grade / 10 : grade); // Convert if needed, but should be 0-10 already
        }, 0);
        
        extracurricularScore = activities.length > 0 ? 
          parseFloat((totalGrade / activities.length).toFixed(2)) : 0;
      }

      // Calculate teacher remarks score (already in 0-10 scale)
      if (student.performance && student.performance.teacherRemarks && student.performance.teacherRemarks.length > 0) {
        const remarks = student.performance.teacherRemarks;
        const totalGrade = remarks.reduce((sum, remark) => {
          const grade = parseFloat(remark.grade || 0);
          return sum + (grade > 10 ? grade / 10 : grade); // Convert if needed, but should be 0-10 already
        }, 0);
        
        remarksScore = remarks.length > 0 ? 
          parseFloat((totalGrade / remarks.length).toFixed(2)) : 0;
      }

      // Calculate weighted score (70% academic, 20% extracurricular, 10% remarks)
      const totalScore = parseFloat(
        ((academicScore * 0.7) + (extracurricularScore * 0.2) + (remarksScore * 0.1)).toFixed(2)
      );

      return {
        student,
        academicScore,
        extracurricularScore,
        remarksScore,
        totalScore
      };
    });

    // Find the student with the highest total score
    const bestStudent = studentsWithScores.reduce(
      (best, current) => (current.totalScore > best.totalScore ? current : best),
      studentsWithScores[0]
    );

    // Convert data to a more frontend-friendly format
    const studentObj = bestStudent.student.toObject();
    
    res.status(200).json({
      bestStudent: {
        ...studentObj,
        academicScore: bestStudent.academicScore,
        extraCurricularScore: bestStudent.extracurricularScore,
        remarksScore: bestStudent.remarksScore,
      },
      totalScore: bestStudent.totalScore,
    });
  } catch (error) {
    console.error('Error getting best performing student:', error);
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

// Get All Students with Performance Data
const getAllStudentsPerformance = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'totalScore', search } = req.query;
    const query = {};

    // Add search by name, email, or PRN if provided
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { prn: new RegExp(search, 'i') }
      ];
    }

    // Get total count for pagination
    const total = await Student.countDocuments(query);

    // Get students with pagination
    const students = await Student.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    if (!students.length) {
      return res.status(404).json({ message: "No students found" });
    }

    // Transform each student to include performance calculations
    const studentsWithPerformance = students.map(student => {
      // Calculate academic scores by year and overall
      const academicByYear = {};
      let totalAcademicScore = 0;
      let totalSubjects = 0;
      
      // Process academic data if it exists
      if (student.performance && student.performance.academic) {
        for (const [year, yearData] of student.performance.academic.entries()) {
          if (yearData.semester) {
            let yearTotal = 0;
            let yearSubjects = 0;
            
            for (const [semester, subjects] of yearData.semester.entries()) {
              if (Array.isArray(subjects)) {
                const validSubjects = subjects.filter(s => s && typeof s.marks === 'number');
                
                // Convert marks to SGPA scale (0-10) if they're in percentage
                const semesterTotal = validSubjects.reduce((sum, subject) => {
                  const marks = parseFloat(subject.marks);
                  // If marks are > 10, they're likely in percentage scale (0-100)
                  return sum + (marks > 10 ? marks / 10 : marks);
                }, 0);
                
                yearTotal += semesterTotal;
                yearSubjects += validSubjects.length;
              }
            }
            
            academicByYear[year] = {
              total: yearTotal,
              subjects: yearSubjects,
              average: yearSubjects > 0 ? parseFloat((yearTotal / yearSubjects).toFixed(2)) : 0
            };
            
            totalAcademicScore += yearTotal;
            totalSubjects += yearSubjects;
          }
        }
      }
      
      // Calculate extracurricular score (already in 0-10 scale)
      const extracurricular = student.performance?.extracurricular || [];
      const extracurricularScore = extracurricular.reduce((sum, activity) => {
        const grade = parseFloat(activity.grade || 0);
        return sum + (grade > 10 ? grade / 10 : grade); // Convert if needed, but should be 0-10 already
      }, 0);
      
      // Calculate teacher remarks score (already in 0-10 scale)
      const teacherRemarks = student.performance?.teacherRemarks || [];
      const teacherRemarksScore = teacherRemarks.reduce((sum, remark) => {
        const grade = parseFloat(remark.grade || 0);
        return sum + (grade > 10 ? grade / 10 : grade); // Convert if needed, but should be 0-10 already
      }, 0);
      
      // Calculate overall academic average in SGPA scale
      const academicAverage = totalSubjects > 0 
        ? parseFloat((totalAcademicScore / totalSubjects).toFixed(2))
        : 0;
      
      // Calculate normalized scores (out of 10 for SGPA)
      const academicScore = Math.min(10, academicAverage);
      const extraCurricularScore = extracurricular.length > 0 
        ? Math.min(10, parseFloat((extracurricularScore / extracurricular.length).toFixed(2)))
        : 0;
      const remarksScore = teacherRemarks.length > 0
        ? Math.min(10, parseFloat((teacherRemarksScore / teacherRemarks.length).toFixed(2)))
        : 0;
      
      // Calculate weighted total score (out of 10)
      const totalScore = parseFloat(
        ((academicScore * 0.7) + 
        (extraCurricularScore * 0.2) + 
        (remarksScore * 0.1)).toFixed(2)
      );
      
      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        academicByYear,
        academicScore,
        extraCurricularScore,
        remarksScore,
        totalScore,
        extracurricular,
        teacherRemarks
      };
    });
    
    // Sort students by the specified field (default: totalScore)
    studentsWithPerformance.sort((a, b) => {
      if (sort === 'name') {
        return a.name.localeCompare(b.name);
      }
      return b[sort] - a[sort];
    });
    
    res.status(200).json({
      data: studentsWithPerformance,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching students with performance:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateAcademicGrades,
  updateExtracurricularGrades,
  updateTeacherRemarks,
  getPerformance,
  getBestPerformingStudent,
  deleteAcademicGrades,
  deleteExtracurricular,
  deleteTeacherRemarks,
  getAllStudentsPerformance
};
