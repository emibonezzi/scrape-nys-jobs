const Scraper = require("./scraper");
const Database = require("./db");
const QueueManager = require("./queue-manager");
const config = require("./config");

exports.handler = async () => {
  const scraper = new Scraper(config.homeUrl);
  const db = new Database(config.mongoUri);
  const queueManager = new QueueManager(config.sqsUrl);
  try {
    await scraper.init();
    await scraper.loadPage();
    const jobs = await scraper.scrapeJobs();
    await db.connect();
    await db.deactivateListings(jobs);
    await queueManager.sendBatch(jobs);
  } catch (err) {
    console.log("Error", err.stack);
    throw err;
  } finally {
    await scraper.closeBrowser();
    await db.disconnect();
  }
};

// exports.handler();
