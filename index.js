import OpenAI from "openai";
import { readFileSync } from "node:fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const data = readFileSync("./prompt2.txt").toString();
// const question = readFileSync("./question.txt").toString()
const chatCompletion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [{ role: "user", content: data }],
  functions: [
    {
      name: "parsing_deepest_level_tags",
      description: "Deepest level of tag for question from a given Tag Tree",
      parameters: {
        type: "object",
        properties: {
          deepestLevelTag: {
            type: "string",
            description:
              "tag which includes deep topic name, example: Vitamins",
          },
        },
        required: ["deepestLevelTag"],
      },
    },
  ],
});
console.log(chatCompletion);
console.log(chatCompletion.choices[0].message.content);
console.log(chatCompletion.choices[0].message.function_call.arguments);
