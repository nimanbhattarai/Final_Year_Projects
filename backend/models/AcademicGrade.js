const mongoose = require("mongoose");

const AcademicGradesSchema = new mongoose.Schema({
  year: { type: String, required: true }, // e.g., "1st Year", "2nd Year"
  semester: { type: String, required: true }, // e.g., "Sem-1", "Sem-2"
  subjects: [
    {
      name: { type: String, required: true }, // Subject Name (e.g., "Mathematics")
      marks: { type: Number, required: true }, // Marks Obtained
    }
  ]
});

const AcademicGrades = mongoose.model("AcademicGrades", AcademicGradesSchema);
module.exports = AcademicGrades;
