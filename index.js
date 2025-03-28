require("dotenv").config();
const Scraper = require("./scraper");
const Database = require("./db");
const config = require("./config");

exports.handler = async () => {
  const scraper = new Scraper(config.homeUrl);
  const db = new Database(config.mongoUri);
  try {
    await scraper.init();
    await scraper.loadPage();
    const jobs = await scraper.scrapeJobs();
    await db.connect();
    await db.saveVacancies(jobs);
  } catch (err) {
    console.log("Error", err.stack);
    throw err;
  } finally {
    await scraper.closeBrowser();
    await db.disconnect();
  }

  /* // connect to db
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
  console.log("New listing check finished."); */
};

// exports.handler();
