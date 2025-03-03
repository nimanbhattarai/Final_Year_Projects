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

// Fetch All Students
const getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
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

module.exports = {
  registerAdmin,
  loginAdmin,
  getStudents,
  updateStudentData,
  deleteStudent
};
