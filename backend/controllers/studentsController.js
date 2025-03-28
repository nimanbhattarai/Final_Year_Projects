const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

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
      socialMedia: student.socialMedia || {},
      photo: student.photo,
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

// Update registerStudent to handle photo upload
const registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if student already exists
    const studentExists = await Student.findOne({ email });
    if (studentExists) {
      return res.status(400).json({
        success: false,
        message: "Student already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Process photo upload if exists
    let photoUrl = "";
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer);
        photoUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
        // Continue with registration even if photo upload fails
      }
    }

    // Create student
    const student = await Student.create({
      name,
      email,
      password: hashedPassword,
      photo: photoUrl, // Add photo URL
    });

    res.status(201).json({
      success: true,
      data: {
        _id: student._id,
        name: student.name,
        email: student.email,
        photo: student.photo,
      },
      message: "Student registered successfully",
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// Get Only Academic Records
const getAcademicRecords = async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await Student.findById(studentId).lean();
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.performance || !student.performance.academic) {
      return res.status(200).json({ academic: {} }); // Return empty object if no data exists
    }

    const academicData = student.performance.academic;
    
    let academicYears = Object.keys(academicData)
      .filter(key => !key.startsWith("$"))
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

// Upload student photo handler
const uploadPhoto = async (req, res) => {
  try {
    // Log the request for debugging
    console.log("Photo upload request received:", {
      file: req.file ? "File attached" : "No file",
      studentId: req.params.studentId,
      user: req.user // From auth middleware
    });
    
    // Check if file exists in request
    if (!req.file) {
      console.log("No file in request");
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }
    
    const studentId = req.params.studentId;
    console.log("Student ID:", studentId);
    
    // Find student in database
    const student = await Student.findById(studentId);
    console.log("Student found:", student ? "Yes" : "No");
    
    if (!student) {
      return res.status(404).json({
        success: false, 
        message: 'Student not found'
      });
    }
    
    try {
      // Upload to Cloudinary
      console.log("Uploading to Cloudinary...");
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        public_id: `student_${studentId}_${Date.now()}`
      });
      console.log(uploadResult)
      console.log("Cloudinary upload successful:", uploadResult.secure_url);
      
      // Update student record with new photo URL
      student.photo = uploadResult.secure_url;
      console.log("Saving student with new photo URL:", student.photo);
      
      // Force save with explicit markModified
      student.markModified('photo');
      const updatedStudent = await student.save();
      console.log("Student saved successfully:", updatedStudent.photo);
      
      // Return success response
      return res.status(200).json({
        success: true,
        data: {
          photoUrl: updatedStudent.photo,
          publicId: uploadResult.public_id
        },
        message: 'Photo uploaded successfully'
      });
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image to cloud storage',
        error: uploadError.message
      });
    }
  } catch (error) {
    console.error('Server error during photo upload:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing upload',
      error: error.message
    });
  }
};

// Test function to debug Cloudinary uploads
const testCloudinaryUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }
    
    console.log("Test upload - file received:", req.file.originalname);
    
    try {
      // Try uploading to Cloudinary
      const result = await uploadToCloudinary(req.file.buffer, {
        public_id: `test_${Date.now()}`
      });
      
      console.log("Upload successful:", result.secure_url);
      
      return res.status(200).json({
        success: true,
        message: 'Test upload successful',
        imageUrl: result.secure_url
      });
    } catch (error) {
      console.error("Cloudinary error:", error);
      return res.status(500).json({
        success: false,
        message: 'Cloudinary upload failed',
        error: error.message
      });
    }
  } catch (error) {
    console.error("Test upload error:", error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  loginStudent,
  getProfile,
  academicAnalysis,
  registerStudent,
  getAcademicRecords,
  uploadPhoto,
  testCloudinaryUpload,
};


