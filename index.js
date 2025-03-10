const Vacancy = require("./schemas/vacancySchema");
const mongoose = require("mongoose");
const cleanVacancy = require("./handlers/cleanVacancy");
require("dotenv").config();

const HOME_URL = "https://statejobs.ny.gov/public/vacancyTable.cfm";
const BASE_VACANCY_URL =
  "https://statejobs.ny.gov/public/vacancyDetailsView.cfm?id=";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); // throttle api requests to OpenAI

const nyRegions = [
  "Western New York",
  "Finger Lakes",
  "Southern Tier",
  "Central New York",
  "Mohawk Valley",
  "Capital District",
  "Hudson Valley",
  "New York City",
  "Long Island",
  "North Country",
];

exports.handler = async () => {
  try {
    // connect to db
    await mongoose.connect(
      `mongodb+srv://admin:${process.env.MONGO_DB_PASS}@statejobsny.ghdod.mongodb.net/?retryWrites=true&w=majority&appName=StateJobsNY`
    );

    // get all db entries
    const dbEntries = await Vacancy.find();

    // check dbEntries and deactivate entry not found in vacanciesIds
    for (let entry of dbEntries) {
      const vacancyToUpdate = await Vacancy.findOne({
        vacancy_id: entry.vacancy_id,
      });
      if (!nyRegions.includes(vacancyToUpdate.nyRegion)) {
        const nyRegionCorrected = await cleanVacancy(vacancyToUpdate.nyRegion);

        console.log(
          "Vacancy id",
          vacancyToUpdate.vacancy_id,
          vacancyToUpdate.nyRegion,
          "corrected to",
          nyRegionCorrected
        );
        vacancyToUpdate.nyRegion = nyRegionCorrected;
        await vacancyToUpdate.save();
        await delay(500);
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    await mongoose.connection.close();
  }
};

exports.handler();
