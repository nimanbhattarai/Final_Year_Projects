const mongoose = require("mongoose");

const studentSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    prn: { 
      type: String, 
      required: function() {
        // Only required during creation, not during updates
        return this.isNew;
      }, 
      unique: true 
    },
    rollNumber: { 
      type: String, 
      required: function() {
        // Only required during creation, not during updates
        return this.isNew;
      }
    },
    address: { type: String, required: false },
    photo: { type: String, default: "" },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    socialMedia: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
    },
    performance: {
      academic: {
        type: Map,
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

// Create indexes
studentSchema.index({ prn: 1 });
studentSchema.index({ name: 1 });
studentSchema.index({ email: 1 });

module.exports = mongoose.model("Student", studentSchema);
