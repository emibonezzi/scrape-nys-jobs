const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const Vacancy = require("./schemas/vacancySchema");
require("dotenv").config();

exports.handler = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });

  const page = await browser.newPage();
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
    const nextButtonClassList = await page.$eval("[data-dt-idx='next']", (el) =>
      Array.from(el.classList)
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

  // connect to db
  await mongoose.connect(
    `mongodb+srv://admin:${process.env.MONGO_DB_PASS}@statejobsny.ghdod.mongodb.net/?retryWrites=true&w=majority&appName=StateJobsNY`
  );

  // check if new changes by checking lengths
  const dbLength = await Vacancy.countDocuments({});

  console.log("Total number of vacancies after check:", vacanciesIds.length);
  console.log("Total number of vacancies in db:", dbLength);

  if (vacanciesIds.length === dbLength) return console.log("No new entries");

  // save ids in db
};

exports.handler();
