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
const question = `"Which of the following numbers is completely divisible by 22?
(1) 51572 (2) 51557
(3) 55036 (4) 42284"`
const tags = {
  Level1: "Numerical Aptitude",
  Level2: "Divisibilty",
  Level3: ""
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
