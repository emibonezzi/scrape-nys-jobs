const axios = require("axios");
const listOfInputs = require("../data/listOfInputs");

/* const input = `You will be given an object related to a NYS vacancy. This item might contain contradictory elements, typos, and other errors. Your task is to return the JSON object with all fields cleaned of typos/ mistakes, and include the following additional fields:
  { 
    macroArea: return one value only from this list:
    
    Long Island
    New York City
    Upstate

    nyRegion: return one value only from this list:

    Capital District
    Western New York
    New York City
    Long Island
    Central New York
    Finger Lakes
    North Country
    Southern Tier
    Hudson Valley
    Mohawk Valley

    actualCity: string // Verify if the city mentioned in the city field corresponds to the city mentioned elsewhere in the object, specifically in the duty description or additional comments section.

    actualCounty: string // Verify if the county mentioned in the county field corresponds to the city/county mentioned elsewhere in the object, specifically in the duty description or additional comments section.

    educationalRequirements: return one value only from this list:

    High School Diploma
    Associate Degree
    Bachelor's Degree
    Master's Degree
    Doctoral Degree
    Not mentioned

    workExperienceRequirements: return one value only from this list:

    Not mentioned 
    1-3
    5+

    keywords: [string] // Analyze the job description and return 3 to 5 keywords

    positionSummary: string // Analyze the duties description and additional comments fields and generate a short summary of the position

    salaryRange: return only ONE valid salary range from this list

    <$60,000 
    $60,000 - $100,000, 
    $100,000 - $150,000,
    $150,000 - $200,000,
    $200,000+
    
  }
   Output only the JSON, without any additional text or explanations.`; */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); // throttle api requests to OpenAI */

module.exports = async (vacancy) => {
  let extraFields = {};

  for (let input of listOfInputs) {
    // for every input send request
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: input.inputPrompt,
          },
          {
            role: "user",
            content: JSON.stringify(vacancy[input.fieldToCheck]),
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
    const content = response.data.choices[0].message.content;
    extraFields[input.fieldName] = content;
    /* console.log(
      vacancy[input.fieldToCheck].slice(0, 20),
      "was changed to",
      content
    ); */
    await delay(500);
  }

  return extraFields;
};
