const axios = require("axios");

const input = `you will be given one input and you have to return only ONE valid NY regions from ONLY these ones: 

Western New York
Finger Lakes
Southern Tier
Central New York
Mohawk Valley
Capital District
Hudson Valley
New York City
Long Island
North Country

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
