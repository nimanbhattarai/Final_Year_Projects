const mongoose = require("mongoose");

const studentSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    performance: {
      academic: {
        type: Map, // To store years dynamically as keys
        of: {
          type: Map,
          of: [{ subject: String, marks: Number }], // Each semester contains subjects with marks
        },
        default: {}, // Default as an empty object
      },
      extracurricular: {
        type: Array,
        default: [], // Default to an empty array
        items: {
          activity: String,
          marks: Number,
        },
      },
      teacherRemarks: {
        type: Array,
        default: [], // Default to an empty array
        items: {
          teacher: String,
          remark: String,
          marks: Number,
        },
      },
    },
    tenthMarks: {
      type: Array,
      default: [], // Default to an empty array
      items: { subject: String, marks: Number },
    },
    twelfthMarks: {
      type: Array,
      default: [], // Default to an empty array
      items: { subject: String, marks: Number },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
