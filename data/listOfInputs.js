module.exports = [
  {
    fieldToCheck: "county",
    inputPrompt:
      "You will be given a county in New York State. Return only one value from this list of macro areas: Long Island, New York City, Upstate. Output only the value with no quotes.",
    fieldName: "macroArea",
  },
  {
    fieldToCheck: "county",
    inputPrompt:
      "You will be given a county in New York State. Return only one value from this list of New York Regions: Capital District, Western New York, New York City, Long Island, Central New York, Finger Lakes, North Country, Southern Tier, Hudson Valley, Mohawk Valley. Output only the value with no quotes.",
    fieldName: "nyRegion",
  },
  {
    fieldToCheck: "minimum_qualifications",
    inputPrompt:
      "You will be given a job description. Return only one value from this list of minimum educational requirements: High School Diploma, Associate Degree, Bachelor's Degree, Master's Degree, Doctoral Degree, Not mentioned. Output only the value with no quotes.",
    fieldName: "educationalRequirements",
  },
  {
    fieldToCheck: "minimum_qualifications",
    inputPrompt:
      "You will be given a job description. Return only one value from this list of years of work experience: Not mentioned, 1-2, 3-5, 6+. Output only the value with no quotes.",
    fieldName: "workExperienceRequirements",
  },
  {
    fieldToCheck: "salary_range",
    inputPrompt:
      "You will be given a salary range. Return only one value from this list of ranges: <$60,000, $60,000 - $100,000, $100,000 - $150,000,$150,000 - $200,000, $200,000+. Output only the value with no quotes.",
    fieldName: "salaryRange",
  },
];
