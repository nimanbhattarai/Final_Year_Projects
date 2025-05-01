const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const connectDB = require("./config/db");
const adminRoutes = require("./routes/adminRoutes");
const performanceRoutes = require("./routes/performanceRoutes");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
// const bodyParser = require("body-parser");

dotenv.config();
connectDB();

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'students');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// CORS configuration
app.use(cors());

app.use(express.json());
// app.use(bodyParser.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/admin", adminRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
