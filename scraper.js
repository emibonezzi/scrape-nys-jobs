const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

class Scraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    this.browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    this.page = await this.browser.newPage();
    console.log("Browser initialized");
  }

  async goTo(url) {
    await this.page.goto(url);
  }

  async scrapeJobs() {
    console.log("Scraping jobs");
    // wait for table to load
    await this.page.waitForSelector("#vacancyTable");
    // expand this.page length to 100 results
    await this.page.select("select#dt-length-0", "100");
    let vacanciesIds = [];

    // start scraping
    while (true) {
      // Extract this.page vacancies in array
      let pageVacancies = await this.page.$$eval("tbody > tr", (vacancies) =>
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
      const nextButtonClassList = await this.page.$eval(
        "[data-dt-idx='next']",
        (el) => Array.from(el.classList)
      );

      // get the current next button
      const nextButton = await this.page.$("[data-dt-idx='next']");

      // if button has "disabled" in his class list exit loop
      if (nextButtonClassList.includes("disabled")) break;

      // click next button
      await nextButton.click();

      // wait until this.page is loaded
      await this.page.waitForNetworkIdle();
    }

    console.log("Scraped", vacanciesIds.length, "jobs.");

    return vacanciesIds;
  }

  async closeBrowser() {
    await this.browser.close();
  }
}

module.exports = Scraper;
