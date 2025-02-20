const puppeteer = require("puppeteer");

exports.handler = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.goto("https://statejobs.ny.gov/public/vacancyTable.cfm");
  // wait for table to load
  await page.waitForSelector("#vacancyTable");
  // expand page length to X results
  await page.select("select#dt-length-0", "100");
  let vacanciesIds = [];
  while (true) {
    // Get the current "Next" button and retrieve its class list
    const nextButtonClassList = await page.$eval("[data-dt-idx='next']", (el) =>
      Array.from(el.classList)
    );

    // Extract vacancies id
    let pageVacancies = await page.$$eval(
      "#vacancyTable tr > td.dt-type-numeric",
      (rows) => rows.map((row) => row.textContent.trim())
    );

    // Click the "Next" button (fetch fresh reference)
    const nextButton = await page.$("[data-dt-idx='next']");

    // push in general vacancies array
    vacanciesIds = [...vacanciesIds, ...pageVacancies];

    if (nextButtonClassList.includes("disabled")) break; // Stop when disabled

    await nextButton.click();

    // Wait for table update
    await page.waitForNetworkIdle();
  }

  console.log(vacanciesIds.length);
};

exports.handler();
