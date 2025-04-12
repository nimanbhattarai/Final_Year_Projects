const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require('crypto');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const { generateRandomPassword, sendPasswordEmail, retryEmailSending } = require("../utils/mailUtils");

// Student Login
const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email });
    if (student && (await bcrypt.compare(password, student.password))) {
      const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });
      res.status(200).json({ 
        token, 
        studentId: student._id,
        hasPhoto: !!student.photo // Add this flag to indicate if photo exists
      });
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
          subjects: (academicData[year].semester[semKey] || []).map(subject => {
            // Convert marks to SGPA scale if they're in percentage
            const marks = parseFloat(subject.marks);
            return {
              ...subject,
              marks: marks > 10 ? parseFloat((marks / 10).toFixed(2)) : parseFloat(marks.toFixed(2))
            };
          }),
        })),
      }));

    // Process extracurricular activities to convert grades to SGPA if needed
    const extracurricular = (student.performance.extracurricular || []).map(activity => {
      const grade = parseFloat(activity.grade || 0);
      return {
        ...activity,
        grade: grade > 10 ? parseFloat((grade / 10).toFixed(2)) : parseFloat(grade.toFixed(2))
      };
    });

    // Process teacher remarks to convert grades to SGPA if needed
    const teacherRemarks = (student.performance.teacherRemarks || []).map(remark => {
      const grade = parseFloat(remark.grade || 0);
      return {
        ...remark,
        grade: grade > 10 ? parseFloat((grade / 10).toFixed(2)) : parseFloat(grade.toFixed(2))
      };
    });

    res.status(200).json({
      name: student.name,
      email: student.email,
      socialMedia: student.socialMedia || {},
      photo: student.photo,
      performance: {
        academic: academicYears, // ✅ Now structured properly with SGPA scale
        extracurricular: extracurricular,
        teacherRemarks: teacherRemarks,
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
          subjects: (academicData[year].semester[semKey] || []).map(subject => {
            // Convert marks to SGPA scale if they're in percentage
            const marks = parseFloat(subject.marks);
            return {
              ...subject,
              marks: marks > 10 ? parseFloat((marks / 10).toFixed(2)) : parseFloat(marks.toFixed(2))
            };
          }),
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

const dataSaving = async (req, res) => {
  try {
    const data = req.body;

    const academicData = {
      year1: {
        semester: {
          semester1: [
            { subject: 'Mathematics For Computing - I', marks: Number(data.math1) },
            { subject: 'Physics For Computing', marks: Number(data.physics) },
            { subject: 'Computer Aided Drafting', marks: Number(data.cad) },
            { subject: 'Digital Electronics', marks: Number(data.digitalElectronics) },
            { subject: 'Structured Programming', marks: Number(data.structuredProgramming) },
            { subject: 'Computer System Workshop Technology', marks: Number(data.cswt) },
          ],
          semester2: [
            { subject: 'Mathematics For Computing - II', marks: Number(data.math2) },
            { subject: 'Organic & ElectroChemistry', marks: Number(data.chemistry) },
            { subject: 'Electrical Technology', marks: Number(data.electrical) },
            { subject: 'Object Oriented Programming', marks: Number(data.oop) },
            { subject: 'Programming Paradigms', marks: Number(data.pp) },
            { subject: 'Web Programming', marks: Number(data.wp) },
          ]
        }
      },
      year2: {
        semester: {
          semester3: [
            { subject: 'Discrete Structures & Graph Theory', marks: Number(data.dsgt) },
            { subject: 'Data Structures', marks: Number(data.ds) },
            { subject: 'Database Management Systems', marks: Number(data.dbms) },
            { subject: 'Software Engineering (ITC-I)', marks: Number(data.se) },
            { subject: 'Computer Communication & Network', marks: Number(data.cn) },
            { subject: 'IT Lab I', marks: Number(data.itl_1) },
            { subject: 'Vocational Course I', marks: Number(data.vc_1) },
          ],
          semester4: [
            { subject: 'Infrastructure Management (ITC-II)', marks: Number(data.infrastructureManagement) },
            { subject: 'Formal Languages', marks: Number(data.formalLanguages) },
            { subject: 'Microcontrollers', marks: Number(data.microcontrollers) },
            { subject: 'Applied Algorithms', marks: Number(data.appliedAlgorithms) },
            { subject: 'Operating Systems', marks: Number(data.operatingSystems) },
            { subject: 'IT Lab II', marks: Number(data.itl_2) },
            { subject: 'Vocational Course II', marks: Number(data.vc_2) },
          ]
        }
      },
      year3: {
        semester: {
          semester5: [
            { subject: 'Human Computer Interaction', marks: Number(data.hci) },
            { subject: 'AI & ML', marks: Number(data.aiml) },
            { subject: 'Computer Architecture & Organization', marks: Number(data.cao) },
            { subject: 'Advanced DBMS (ITC-III)', marks: Number(data.advDbms) },
            { subject: 'Mobile App Development', marks: Number(data.mad) },
            { subject: 'IT Lab III', marks: Number(data.itl_3) },
            { subject: 'Vocational Course III', marks: Number(data.vc_3) },
          ],
          semester6: [
            { subject: 'Cloud Computing (ITC-IV)', marks: Number(data.cloudComputing) },
            { subject: 'Software Testing & Quality Assurance', marks: Number(data.stqa) },
            { subject: 'Data Warehousing & Data Mining', marks: Number(data.dwdm) },
            { subject: 'Quantitative Techniques, Communication and Values', marks: Number(data.qt_communication_values) },
            { subject: 'Agile Methodologies', marks: Number(data.agile) },
            { subject: 'IT Lab IV', marks: Number(data.itl_4) },
            { subject: 'Vocational Course IV', marks: Number(data.vc_4) },
          ]
        }
      },
      year4: {
        semester: {
          semester7: [
            { subject: 'Project Planning & Management', marks: Number(data.ppm) },
            { subject: 'Web Services (ITC-V)', marks: Number(data.webServices) },
            { subject: 'Business Intelligence', marks: Number(data.bi) },
            { subject: 'Information Retrieval (Elective I)', marks: Number(data.ir) },
            { subject: 'IT Lab V', marks: Number(data.itl_5) },
            { subject: 'Internship', marks: Number(data.internship) },
          ],
          semester8: [
            { subject: 'Information Security', marks: Number(data.infoSecurity) },
            { subject: 'Cyber Security (Elective II)', marks: Number(data.cyberSecurity) },
            { subject: 'Internet of Things', marks: Number(data.iot) },
            { subject: 'Data Engineering', marks: Number(data.dataEngineering) },
            { subject: 'IT Lab VI', marks: Number(data.itl_6) },
          ]
        }
      }
    };
    

    const existingStudent = await Student.findOne({ email: data.email });

    if (existingStudent) {
      existingStudent.performance.academic = academicData;
      if (data.socialMedia) {
        existingStudent.socialMedia = data.socialMedia;
      }
      await existingStudent.save();

      return res.status(200).json({ message: "Data updated successfully" });
    }

    const tempPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newStudent = await Student.create({
      name: data.name,
      email: data.email,
      prn: data.prn,
      rollNumber: data.rollNumber,
      address: data.address,
      password: hashedPassword,
      socialMedia: data.socialMedia || {
        facebook: '',
        instagram: '',
        linkedin: '',
        github: ''
      },
      performance: { academic: academicData }
    });

    const response = await sendPasswordEmail(newStudent.email, tempPassword);
    if (!response.valid) {
      await retryEmailSending(newStudent.email, tempPassword);
    }

    return res.status(200).json({ message: "Student created successfully and credentials sent" });

  } catch (error) {
    console.error("Error saving data:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

    // Update student with reset token using findOneAndUpdate
    await Student.findOneAndUpdate(
      { email },
      {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry
      },
      { new: true, runValidators: false }
    );

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>You requested a password reset</h1>
        <p>Click this link to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process password reset request",
      error: error.message,
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find student with valid reset token
    const student = await Student.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update student password and clear reset token using findOneAndUpdate
    await Student.findOneAndUpdate(
      { _id: student._id },
      {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined
      },
      { new: true, runValidators: false }
    );

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};

// Upload Profile Photo
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { studentId } = req.body;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const uploadResult = await uploadToCloudinary(req.file.buffer);
    student.photo = uploadResult.secure_url;
    await student.save();

    res.status(200).json({
      message: "Profile photo uploaded successfully",
      photo: uploadResult.secure_url
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
  dataSaving,
  forgotPassword,
  resetPassword,
  uploadProfilePhoto
};


