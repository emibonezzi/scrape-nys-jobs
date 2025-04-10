const sqs = require("@aws-sdk/client-sqs");
const client = new sqs.SQSClient({});

class QueueManager {
  constructor(sqsUrl) {
    this.sqsUrl = sqsUrl;
  }

  async sendBatch(vacancies, batchSize = 10) {
    console.log("Sending jobs to SQS queue...");
    const results = {
      batchesSent: 0,
    };
    for (let i = 0; i < vacancies.length; i += batchSize) {
      // slice vacancies in batches of ten
      const currentBatch = vacancies.slice(i, i + batchSize);
      // create batch with ids
      const messageBatch = currentBatch.map((vacancy, index) => ({
        Id: `${vacancy.vacancy_id}_${index}`,
        MessageBody: JSON.stringify(vacancy),
      }));
      const command = new sqs.SendMessageBatchCommand({
        QueueUrl: this.sqsUrl,
        Entries: messageBatch,
      });
      try {
        const response = await client.send(command);
        results.batchesSent++;
      } catch (err) {
        console.error("Error in sending batch", err.message);
        continue;
      }
    }

    console.log("Sent", results.batchesSent, "to SQS queue.");
  }
}

module.exports = QueueManager;
