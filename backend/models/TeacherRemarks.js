const TeacherRemarksSchema = new mongoose.Schema({
    teacherName: { type: String, required: false, default: '' }, // Optional teacher's name
    remark: { type: String, required: true }, // Remark or comment
    grade: { type: Number, required: true }, // Grade/Marks assigned by the teacher
  });
  
  const TeacherRemarks = mongoose.model("TeacherRemarks", TeacherRemarksSchema);
  module.exports = TeacherRemarks;
  