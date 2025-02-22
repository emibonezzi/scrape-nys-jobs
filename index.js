const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const Vacancy = require("./schemas/vacancySchema");
const mongoose = require("mongoose");
require("dotenv").config();

const HOME_URL = "https://statejobs.ny.gov/public/vacancyTable.cfm";
const BASE_VACANCY_URL =
  "https://statejobs.ny.gov/public/vacancyDetailsView.cfm?id=";

exports.handler = async () => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  const page = await browser.newPage();
  try {
    await page.goto(HOME_URL);
    // wait for table to load
    await page.waitForSelector("#vacancyTable");
    // expand page length to 100 results
    await page.select("select#dt-length-0", "100");
    let vacanciesIds = [];

    // start scraping
    while (true) {
      // Extract page vacancies in array
      let pageVacancies = await page.$$eval("tbody > tr", (vacancies) =>
        vacancies.map((vacancy) => {
          return {
            vacancy_id: vacancy.querySelectorAll("td")[0].innerText,
            title: vacancy.querySelectorAll("td")[1].innerText,
            grade: vacancy.querySelectorAll("td")[2].innerText,
            date_posted: vacancy.querySelectorAll("td")[3].innerText,
            deadline: vacancy.querySelectorAll("td")[4].innerText,
            department: vacancy.querySelectorAll("td")[5].innerText,
            county: vacancy.querySelectorAll("td")[6].innerText,
            active: true,
          };
        })
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

    // connect to db
    await mongoose.connect(
      `mongodb+srv://admin:${process.env.MONGO_DB_PASS}@statejobsny.ghdod.mongodb.net/?retryWrites=true&w=majority&appName=StateJobsNY`
    );

    // mongoose.set("debug", true);

    // get all db entries
    const dbEntries = await Vacancy.find({ active: true });

    console.log("Deactivating inactive listings...");

    // check dbEntries and deactivate entry not found in vacanciesIds
    for (let entry of dbEntries) {
      if (
        !vacanciesIds
          .map((vacancy) => vacancy.vacancy_id)
          .includes(entry.vacancy_id)
      ) {
        console.log("Deactivating vacancy", entry.vacancy_id);
        const missingVacancy = await Vacancy.findOne({
          vacancy_id: entry.vacancy_id,
        });
        missingVacancy.active = false;
        await missingVacancy.save();
      }
    }

    console.log("Deactivation check finished.");
    console.log("Checking new listings...");

    // check scraped vacancies in db and add if not found
    for (let vacancy of vacanciesIds) {
      if (dbEntries.map((v) => v.vacancy_id).includes(vacancy.vacancy_id))
        continue;
      // go to vacancy page detail
      await page.goto(`${BASE_VACANCY_URL}${vacancy.vacancy_id}`);
      // wait for the information panel to load
      await page.waitForSelector(".ui-tabs");
      // get all vacancy details in array
      const vacancyDetails = await page.$$eval(".ui-tabs-panel", (tabs) =>
        tabs.map((tab) =>
          Array.from(tab.querySelectorAll(".row")).map((row) => [
            row.querySelector(".leftCol").childNodes[1]
              ? row
                  .querySelector(".leftCol")
                  .childNodes[1].textContent.trim()
                  .split(" ")
                  .join("_")
                  .toLowerCase()
              : "street_2", // for 2 line addresses
            row.querySelector(".rightCol").innerText.trim(),
          ])
        )
      );

      // add props to the vacancy
      vacancyDetails.map((tab) =>
        tab.map((prop) => {
          vacancy[prop[0]] = prop[1];
        })
      );

      // save vacancy in db
      const newVacancy = new Vacancy(vacancy);
      await newVacancy.save();
      console.log(`Vacancy ${vacancy.vacancy_id} saved.`);
    }
    console.log("New listing check finished.");
  } catch (error) {
    console.log(error.message);
  } finally {
    await mongoose.connection.close();
    await browser.close();
  }
};

// exports.handler();
