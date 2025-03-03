const TeacherRemarksSchema = new mongoose.Schema({
    teacherName: { type: String, required: true }, // Teacher's name
    remark: { type: String, required: true }, // Remark or comment
    grade: { type: Number, required: true }, // Grade/Marks assigned by the teacher
  });
  
  const TeacherRemarks = mongoose.model("TeacherRemarks", TeacherRemarksSchema);
  module.exports = TeacherRemarks;
  