const mongoose = require("mongoose");

const vacancySchema = new mongoose.Schema({
  vacancyId: String,
  active: Boolean,
});

module.exports = mongoose.model("Vacancy", vacancySchema);
