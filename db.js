const mongoose = require("mongoose");
const Vacancy = require("./schemas/vacancySchema");

class Database {
  constructor(uri) {
    this.uri = uri;
  }

  async connect() {
    await mongoose.connect(this.uri);
    console.log("Successfully connected to db");
  }

  async getAllActiveVacancies() {
    return await Vacancy.find({ active: true });
  }

  async deactivateListings(scrapedJobs) {
    console.log("Deactivating existing listings...");
    const results = {
      deactivatedVacancies: 0,
    };
    const databaseJobs = await this.getAllActiveVacancies();
    for (const entry of databaseJobs) {
      if (
        !scrapedJobs
          .map((vacancy) => vacancy.vacancy_id)
          .includes(entry.vacancy_id)
      ) {
        console.log("Deactivating vacancy", entry.vacancy_id);
        const missingVacancy = await Vacancy.findOneAndUpdate(
          {
            vacancy_id: entry.vacancy_id,
          },
          { active: false }
        );
        results.deactivatedVacancies++;
      }
    }

    console.log("Deactivated", results.deactivatedVacancies, "vacancies.");
  }

  async disconnect() {
    await mongoose.disconnect();
  }
}

module.exports = Database;
