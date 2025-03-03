const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Student Login
const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email });
    if (student && (await bcrypt.compare(password, student.password))) {
      const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });
      res.status(200).json({ token, studentId: student._id });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View Profile
// const getProfile = async (req, res) => {
//   const { studentId } = req.params;

//   try {
//     const student = await Student.findById(studentId);
//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     res.status(200).json({
//       name: student.name,
//       email: student.email,
//       performance: student.performance,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


const getProfile = async (req, res) => {
  const { studentId } = req.params;

  try {
    // 🔥 Fetch student and convert it to a plain JSON object
    const student = await Student.findById(studentId).lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.performance || !student.performance.academic) {
      return res.status(404).json({ message: "No academic records found" });
    }

    // 🔥 Extract academic data properly
    const academicData = student.performance.academic;

    let academicYears = Object.keys(academicData)
      .filter(key => !key.startsWith("$")) // Ignore Mongoose internals
      .map(year => ({
        year,
        semesters: Object.keys(academicData[year].semester || {}).map(semKey => ({
          semester: semKey,
          subjects: academicData[year].semester[semKey] || [],
        })),
      }));

    res.status(200).json({
      name: student.name,
      email: student.email,
      performance: {
        academic: academicYears, // ✅ Now structured properly
        extracurricular: student.performance.extracurricular || [],
        teacherRemarks: student.performance.teacherRemarks || [],
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Academic Analysis
const academicAnalysis = async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const { academic } = student.performance;

    if (!academic) {
      return res.status(404).json({ message: "No academic data found" });
    }

    // Calculate overall performance and trends
    const yearlyPerformance = Object.entries(academic).map(([year, semesters]) => {
      const totalMarks = Object.values(semesters).flat().reduce((sum, marks) => sum + marks, 0);
      return { year, totalMarks };
    });

    const interests = Object.entries(student.performance.extracurricular || []).map(([_, entry]) => entry.activity);

    res.status(200).json({
      yearlyPerformance,
      interests,
      message: "Academic analysis completed",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Register a New Student
const registerStudent = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the student already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Student already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new student
    const newStudent = new Student({
      name,
      email,
      password: hashedPassword,
      performance: {
        academic: {},
        extracurricular: [],
        teacherRemarks: [],
      },
    });

    // Save the student to the database
    await newStudent.save();

    res.status(201).json({ message: "Student registered successfully", student: newStudent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Only Academic Records
const getAcademicRecords = async (req, res) => {
  const { studentId } = req.params;

  try {
    // 🔥 Fetch the student data and convert it to a plain JSON object
    const student = await Student.findById(studentId).lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.performance || !student.performance.academic) {
      return res.status(404).json({ message: "No academic records found" });
    }

    // 🔥 Ensure `academic` is an object and extract only valid academic years
    const academicData = student.performance.academic;
    
    let academicYears = Object.keys(academicData)
      .filter(key => !key.startsWith("$")) // Ignore Mongoose internals
      .map(year => ({
        year,
        semesters: Object.keys(academicData[year].semester || {}).map(semKey => ({
          semester: semKey,
          subjects: academicData[year].semester[semKey] || [],
        })),
      }));

    res.status(200).json({ academic: academicYears });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  loginStudent,
  getProfile,
  academicAnalysis,
  registerStudent, // Export the new function
  getAcademicRecords
};


