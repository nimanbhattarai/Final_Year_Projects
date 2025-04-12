const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const { generateRandomPassword, sendPasswordEmail } = require('../utils/mailUtils');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const nodemailer = require("nodemailer");
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new teacher
// @route   POST /api/teacher/register
// @access  Public
const registerTeacher = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if teacher already exists
    const teacherExists = await Teacher.findOne({ email });
    if (teacherExists) {
      return res.status(400).json({
        success: false,
        message: 'Teacher with this email already exists'
      });
    }

    // Generate temporary password
    const tempPassword = generateRandomPassword();

    // Create teacher
    const teacher = await Teacher.create({
      name,
      email,
      password: tempPassword
    });

    // Send email with temporary password
    try {
      const emailResult = await sendPasswordEmail(email, tempPassword);
      
      if (emailResult.valid) {
        res.status(201).json({
          success: true,
          message: 'Teacher registered successfully. Please check your email for the temporary password.'
        });
      } else {
        // If email fails, still return success but with password in response
        res.status(201).json({
          success: true,
          message: 'Teacher registered successfully. Please save your temporary password.',
          tempPassword: tempPassword
        });
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // If email fails, return success with password in response
      res.status(201).json({
        success: true,
        message: 'Teacher registered successfully. Please save your temporary password.',
        tempPassword: tempPassword
      });
    }
  } catch (error) {
    console.error('Teacher registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration'
    });
  }
};

// @desc    Login teacher
// @route   POST /api/teacher/login
// @access  Public
const loginTeacher = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Find teacher by email
  const teacher = await Teacher.findOne({ email }).select('+password');

  if (!teacher || !(await teacher.correctPassword(password, teacher.password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Create token
  const token = generateToken(teacher._id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email
      },
    },
  });
});

// @desc    Get teacher profile
// @route   GET /api/teacher/profile
// @access  Private
const getTeacherProfile = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.user.id).select('-password');
  
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  res.status(200).json({
    success: true,
    data: teacher
  });
});

// @desc    Add a teacher remark for a student
// @route   POST /api/teacher/remarks/:studentId
// @access  Private
const addTeacherRemark = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { teacherName, remark, grade } = req.body;

  // Validate input
  if (!teacherName || !remark || grade === undefined) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const student = await Student.findById(studentId);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  // Initialize performance and teacherRemarks if they don't exist
  if (!student.performance) {
    student.performance = {};
  }
  if (!student.performance.teacherRemarks) {
    student.performance.teacherRemarks = [];
  }

  // Add new remark
  student.performance.teacherRemarks.push({
    teacherName,
    remark,
    grade: Number(grade),
    date: new Date()
  });

  await student.save();

  res.status(201).json({
    success: true,
    message: 'Teacher remark added successfully',
    data: student.performance.teacherRemarks
  });
});

// @desc    Get teacher remarks for a student
// @route   GET /api/teacher/remarks/:studentId
// @access  Private
const getTeacherRemarks = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const student = await Student.findById(studentId);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  res.status(200).json({
    success: true,
    teacherRemarks: student.performance?.teacherRemarks || []
  });
});

// @desc    Delete a teacher remark
// @route   DELETE /api/teacher/remarks/:studentId/:remarkIndex
// @access  Private
const deleteTeacherRemark = asyncHandler(async (req, res) => {
  const { studentId, remarkIndex } = req.params;

  const student = await Student.findById(studentId);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  if (!student.performance?.teacherRemarks || remarkIndex >= student.performance.teacherRemarks.length) {
    res.status(404);
    throw new Error('Remark not found');
  }

  // Remove the remark at the specified index
  student.performance.teacherRemarks.splice(remarkIndex, 1);
  await student.save();

  res.status(200).json({
    success: true,
    message: 'Remark deleted successfully',
    data: student.performance.teacherRemarks
  });
});

// @desc    Forgot Password
// @route   POST /api/teacher/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const teacher = await Teacher.findOne({ email });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "No teacher account found with this email",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

    // Update teacher with reset token
    await Teacher.findOneAndUpdate(
      { email },
      {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry
      },
      { new: true, runValidators: false }
    );

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/teacher/reset-password/${resetToken}`;

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
      subject: 'Teacher Password Reset Request',
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

// @desc    Reset Password
// @route   POST /api/teacher/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find teacher with valid reset token
    const teacher = await Teacher.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!teacher) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update teacher password and clear reset token
    await Teacher.findOneAndUpdate(
      { _id: teacher._id },
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

module.exports = {
  registerTeacher,
  loginTeacher,
  getTeacherProfile,
  addTeacherRemark,
  getTeacherRemarks,
  deleteTeacherRemark,
  forgotPassword,
  resetPassword
}; 