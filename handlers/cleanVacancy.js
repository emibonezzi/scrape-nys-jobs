const axios = require("axios");

const input = `you will be given one input and you have to return valid years of experience from this list ONLY: 

Not mentioned
1-3
5+

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
