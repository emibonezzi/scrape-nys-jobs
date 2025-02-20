const mongoose = require("mongoose");

const vacancySchema = new mongoose.Schema({
  vacancyId: String,
});

module.exports = mongoose.model("Vacancy", vacancySchema);
