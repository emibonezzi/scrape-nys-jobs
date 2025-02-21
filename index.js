const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const Vacancy = require("./schemas/vacancySchema");
require("dotenv").config();

exports.handler = async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();
  try {
    await page.goto("https://statejobs.ny.gov/public/vacancyTable.cfm");
    // wait for table to load
    await page.waitForSelector("#vacancyTable");
    // expand page length to 100 results
    await page.select("select#dt-length-0", "100");
    let vacanciesIds = [];

    // start scraping
    while (true) {
      // Extract page vacancies ids in array
      let pageVacancies = await page.$$eval(
        "#vacancyTable tr > td.dt-type-numeric",
        (rows) => rows.map((row) => row.textContent.trim())
      );

      // push in global vacancies array
      vacanciesIds = [...vacanciesIds, ...pageVacancies];

      // Get the current "Next" button and retrieve its class list
      const nextButtonClassList = await page.$eval(
        "[data-dt-idx='next']",
        (el) => Array.from(el.classList)
      );

      // get the current next button
      const nextButton = await page.$("[data-dt-idx='next']");

      // if button has "disabled" in his class list exit loop
      if (nextButtonClassList.includes("disabled")) break;

      // click next button
      await nextButton.click();

      // wait until page is loaded
      await page.waitForNetworkIdle();
    }

    await browser.close();

    // connect to db
    await mongoose.connect(
      `mongodb+srv://admin:${process.env.MONGO_DB_PASS}@statejobsny.ghdod.mongodb.net/?retryWrites=true&w=majority&appName=StateJobsNY`
    );

    mongoose.set("debug", true);

    // get all db entries
    const dbEntries = await Vacancy.find({ active: true });

    // check dbEntries and deactivate entry not found in vacanciesIds
    for (let entry of dbEntries) {
      if (!vacanciesIds.includes(entry.vacancyId)) {
        console.log("Deactivating vacancy", entry.vacancyId);
        const missingVacancy = await Vacancy.findOne({
          vacancyId: entry.vacancyId,
        });
        missingVacancy.active = false;
        await missingVacancy.save();
      }
    }

    console.log("Db check vs scraped finished");

    // check scraped vacancies in db and add if not found
    for (let vacancy of vacanciesIds) {
      if (dbEntries.map((v) => v.vacancyId).includes(vacancy)) continue;
      const newVacancy = new Vacancy({
        vacancyId: vacancy,
        active: true,
      });
      await newVacancy.save();
      console.log(`Vacancy ${vacancy} saved.`);
    }

    console.log("Scrape check vs db finished");
  } catch (error) {
    console.log(error.message);
  } finally {
    await mongoose.connection.close();
    await browser.close();
  }
};

exports.handler();
