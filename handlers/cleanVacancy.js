const axios = require("axios");

const input = `you will be given one input and you have to return only ONE valid salary range from these ones: 

<$60,000
$60,000 - $100,000
$100,000 - $150,000
$150,000 - $200,000
$200,000+

Output your pick only without quotes.`;

module.exports = async (vacancy) => {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: input,
        },
        {
          role: "user",
          content: vacancy,
        },
      ],
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
      },
    }
  );

  return response.data.choices[0].message.content;
};
