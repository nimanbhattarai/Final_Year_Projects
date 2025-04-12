const ExtraCurricularSchema = new mongoose.Schema({
    activity: { type: String, required: true }, // e.g., "Basketball", "Music Club"
    grade: { type: Number, required: true }, // Grade/Marks for the activity
  });
  
  const ExtraCurricular = mongoose.model("ExtraCurricular", ExtraCurricularSchema);
  module.exports = ExtraCurricular;
  