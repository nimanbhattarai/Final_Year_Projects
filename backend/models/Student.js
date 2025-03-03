const mongoose = require("mongoose");

const studentSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    performance: {
      academic: {
        type: Map, // Use Map for structured academic data
        of: new mongoose.Schema({
          semester: {
            type: Map,
            of: [
              {
                subject: { type: String, required: true },
                marks: { type: Number, required: true }
              }
            ]
          }
        }),
        default: {}
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
