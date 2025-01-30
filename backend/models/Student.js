const mongoose = require("mongoose");

const studentSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    performance: {
      academic: {
        type: Object, // Using Map for year-wise academic records
        of: Object, // Each year holds semester-wise records
        default: ([]),
      },
      extracurricular: {
        type: Array,
        default: [],
      },
      teacherRemarks: {
        type: Array,
        default: [],
      },
    },
    tenthMarks: {
      type: Array,
      default: [],
    },
    twelfthMarks: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
