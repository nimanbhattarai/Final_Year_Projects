const Admin = require("../models/Admin");
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Admin Registration
const registerAdmin = async (req, res) => {
  console.log("Entered admin register controller");
  const { name, email, password } = req.body;
  console.log("After body");

  try {
    
    console.log("IN try catch block")
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    // Respond with success message
    res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Login
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (admin && (await bcrypt.compare(password, admin.password))) {
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });
      res.status(200).json({ token });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch All Students with pagination, sorting, and search
const getStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'name', search } = req.query;
    const query = {};

    // Add search by PRN if provided
    if (search) {
      query.prn = new RegExp(search, 'i');
    }

    // Get total count for pagination
    const total = await Student.countDocuments(query);

    // Get students with pagination and sorting
    const students = await Student.find(query)
      .sort({ [sort]: 1 }) // 1 for ascending, -1 for descending
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('name email prn rollNumber photo'); // Select only needed fields

    res.status(200).json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add/Update Student Data
const updateStudentData = async (req, res) => {
  const { studentId, data } = req.body;

  try {
    const student = await Student.findById(studentId); // Find student by ID
    if (student) {
      // Merge new data with the existing student document
      Object.keys(data).forEach((key) => {
        if (Array.isArray(student[key]) && Array.isArray(data[key])) {
          student[key] = [...student[key], ...data[key]]; // Merge arrays
        } else {
          student[key] = data[key]; // Update other fields
        }
      });

      await student.save(); // Save updated document
      res.status(200).json({ message: "Student data updated", student });
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete Student
const deleteStudent = async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await Student.findByIdAndDelete(studentId);
    if (student) {
      res.status(200).json({ message: "Student deleted successfully" });
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all students with performance data for rankings
const getStudentsWithPerformance = async (req, res) => {
  try {
    const students = await Student.find();
    
    if (!students.length) {
      return res.status(404).json({ message: "No students found" });
    }

    // Process each student to calculate performance metrics
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
                yearTotal += validSubjects.reduce((sum, subject) => sum + subject.marks, 0);
                yearSubjects += validSubjects.length;
              }
            }
            
            academicByYear[year] = {
              total: yearTotal,
              subjects: yearSubjects,
              average: yearSubjects > 0 ? Math.round((yearTotal / yearSubjects) * 10) / 10 : 0
            };
            
            totalAcademicScore += yearTotal;
            totalSubjects += yearSubjects;
          }
        }
      }
      
      // Calculate extracurricular score
      const extracurricular = student.performance?.extracurricular || [];
      const extracurricularScore = extracurricular.reduce(
        (sum, activity) => sum + (activity.grade || 0), 
        0
      );
      
      // Calculate teacher remarks score
      const teacherRemarks = student.performance?.teacherRemarks || [];
      const teacherRemarksScore = teacherRemarks.reduce(
        (sum, remark) => sum + (remark.grade || 0), 
        0
      );
      
      // Calculate overall academic average
      const academicAverage = totalSubjects > 0 
        ? Math.round((totalAcademicScore / totalSubjects) * 10) / 10 
        : 0;
      
      // Calculate normalized scores (out of 100)
      const academicScore = Math.min(100, Math.round((academicAverage / 100) * 100));
      const extraCurricularScore = Math.min(100, Math.round((extracurricularScore / (extracurricular.length * 10)) * 100) || 0);
      const remarksScore = Math.min(100, Math.round((teacherRemarksScore / (teacherRemarks.length * 10)) * 100) || 0);
      
      // Calculate weighted total score
      const totalScore = Math.round(
        (academicScore * 0.7) + 
        (extraCurricularScore * 0.2) + 
        (remarksScore * 0.1)
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
    
    // Sort students by total score (descending)
    studentsWithPerformance.sort((a, b) => b.totalScore - a.totalScore);
    
    res.status(200).json(studentsWithPerformance);
  } catch (error) {
    console.error('Error fetching students with performance:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add the getStudent function
const getStudent = async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await Student.findById(studentId)
      .select('_id name email socialMedia createdAt');
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getStudents,
  updateStudentData,
  deleteStudent,
  getStudentsWithPerformance,
  getStudent
};
