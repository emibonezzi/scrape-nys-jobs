const mongoose = require("mongoose");

const vacancySchema = new mongoose.Schema(
  {
    vacancy_id: { type: String, unique: true },
    title: String,
    grade: String,
    date_posted: String,
    deadline: String,
    department: String,
    county: String,
    active: Boolean,
  },
  { strict: false }
);

module.exports = mongoose.model("Vacancy", vacancySchema);
