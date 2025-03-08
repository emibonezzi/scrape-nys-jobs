const Vacancy = require("./schemas/vacancySchema");
const mongoose = require("mongoose");
const cleanVacancy = require("./handlers/cleanVacancy");
require("dotenv").config();

const HOME_URL = "https://statejobs.ny.gov/public/vacancyTable.cfm";
const BASE_VACANCY_URL =
  "https://statejobs.ny.gov/public/vacancyDetailsView.cfm?id=";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); // throttle api requests to OpenAI

const salaries = [
  "<$60,000",
  "$60,000 - $100,000",
  "$100,000 - $150,000",
  "$150,000 - $200,000",
  "$200,000+",
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
      if (!salaries.includes(vacancyToUpdate.salaryRange)) {
        const salaryRangeCorrected = await cleanVacancy(
          vacancyToUpdate.salary_range
        );

        vacancyToUpdate.salaryRange = salaryRangeCorrected;
        await vacancyToUpdate.save();
        console.log(
          "Vacancy id",
          vacancyToUpdate.vacancy_id,
          vacancyToUpdate.salary_range,
          "corrected to",
          salaryRangeCorrected
        );
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
