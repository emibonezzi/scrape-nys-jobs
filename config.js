require("dotenv").config();

module.exports = {
  homeUrl: process.env.HOME_URL,
  mongoUri: process.env.MONGO_URI,
  sqsUrl: process.env.SQS_URL,
};
