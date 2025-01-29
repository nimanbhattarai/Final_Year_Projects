const mongoose = require("mongoose");

const AcademicGradesSchema = new mongoose.Schema({
  year: { type: String, required: true }, // e.g., "1st Year", "2nd Year"
  semester: { type: String, required: true }, // e.g., "Sem-1", "Sem-2"
  subjects: {
    type: Map,
    of: Number, // Key: Subject Name, Value: Marks
    required: true,
  },
});

const AcademicGrades = mongoose.model("AcademicGrades", AcademicGradesSchema);
module.exports = AcademicGrades;
