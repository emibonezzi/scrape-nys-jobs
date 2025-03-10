const Vacancy = require("./schemas/vacancySchema");
const mongoose = require("mongoose");
const cleanVacancy = require("./handlers/cleanVacancy");
require("dotenv").config();

const HOME_URL = "https://statejobs.ny.gov/public/vacancyTable.cfm";
const BASE_VACANCY_URL =
  "https://statejobs.ny.gov/public/vacancyDetailsView.cfm?id=";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); // throttle api requests to OpenAI

const YOE = ["Not mentioned", "1-3", "5+"];

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
      if (!YOE.includes(vacancyToUpdate.workExperienceRequirements)) {
        const workExperienceRequirementsCorrected = await cleanVacancy(
          vacancyToUpdate.minimum_qualifications
        );
        console.log(
          "Vacancy id",
          vacancyToUpdate.vacancy_id,
          vacancyToUpdate.workExperienceRequirements,
          "corrected to",
          workExperienceRequirementsCorrected
        );
        vacancyToUpdate.workExperienceRequirements =
          workExperienceRequirementsCorrected;
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
