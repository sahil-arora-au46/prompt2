import { readFileSync }  from "node:fs";
import { createTagTree } from "./createTree.js";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

const data = readFileSync("./prompt1output.csv")
const parsedData = (JSON.parse(data))
// const question = parsedData[99].Question
// const tags = JSON.parse(parsedData[99].output)
const question = `"Dairy comes under which sector of economic activity?

(1) Tertiary sector
(2) Primary sector
(3) Secondary sector
(4) Quaternary sector"`
const tags = {
    Level1: 'Economy',
    Level2: 'Sectors of economy',
    Level3: 'null'
  }
  
console.log(tags)
// const tree = createTagTree(JSON.parse(tags))
const tree = createTagTree((tags))
console.log('tree',tree)


const prompt2 =readFileSync("./prompt2.txt").toString();
const split = prompt2.split(`"""`)
split.splice(1,0,`"""${tree}"""`)
const finalPrompt = split.join("\n").concat(question)
console.log(question)
// console.log(finalPrompt)
const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: finalPrompt }],
    // functions: [
    //   {
    //     name: "parsing_deepest_level_tags",
    //     description: "Deepest level of tag for question from a given Tag Tree",
    //     parameters: {
    //       type: "object",
    //       properties: {
    //         deepestLevelTag: {
    //           type: "string",
    //           description:
    //             "tag which includes deep topic name, example: Vitamins",
    //         },
    //       },
    //       required: ["deepestLevelTag"],
    //     },
    //   }
    // ]
  });
  console.log(chatCompletion);
  console.log(chatCompletion.choices[0].message.content);
//   console.log(chatCompletion.choices[0].message.function_call.arguments);
