const mongoose = require("mongoose");
const Vacancy = require("./schemas/vacancySchema");

class Database {
  constructor(uri) {
    this.uri = uri;
  }

  async connect() {
    try {
      await mongoose.connect(this.uri);
      console.log("Successfully connected to db");
    } catch (err) {
      console.log("Error in connecting to db", err.message);
    }
  }

  async getAllVacancies() {
    return await Vacancy.find({});
  }

  async saveVacancies(vacancies) {
    if (!vacancies || vacancies.length === 0) return;

    const bulkOps = vacancies.map((vacancy) => ({
      updateOne: {
        filter: { vacancy_id: vacancy.vacancy_id }, // Match existing doc by ID
        update: { $set: vacancy }, // Update fields if duplicate exists
        upsert: true, // Insert if not found
      },
    }));

    try {
      const savedJobs = await Vacancy.bulkWrite(bulkOps);
      const inserted = savedJobs.upsertedCount || 0;
      const updated = savedJobs.modifiedCount || 0;
      if (inserted === 0 && updated === 0) {
        console.log("No new or updated vacancies.");
      } else {
        console.log(`Inserted: ${inserted} new vacancies.`);
        console.log(`Updated: ${updated} existing vacancies.`);
      }
    } catch (err) {
      console.log("Error in saving vacancies", err.message);
    }
  }

  async disconnect() {
    await mongoose.disconnect();
  }
}

module.exports = Database;
