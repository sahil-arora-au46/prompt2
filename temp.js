import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { textCosineSimilarity } from "./similarity.js";

const data = readFileSync("./subjectTagsData.json").toString();
const tags = {
    Level1: 'english',
    Level2: 'principal verb'
  };
// let tags;

const parsedData = JSON.parse(data);
const subjectTagsData = Object.values(parsedData);
let branches = [];
let tagData = {};
let parentTag;
function createBranch() {
    for (let level in tags) {
        if (tags[level]) {
            tags[level] = tags[level].toLowerCase();
        }
    }
    parentTag = subjectTagsData.find((el) => {
      if (el.height === 0 && el.name.toLowerCase() === tags.Level1) {
        return el;
      }
    });
    tagData[parentTag.id] = {
        name:parentTag.name,
        height:parentTag.height
    }
  subjectTagsData.forEach((tag,index) => {
    tag.name = tag.name.toLowerCase();
    if (tag.ancestor) {
      if (tag.ancestor.includes(parentTag.id)) {
        tagData[tag.id] = {
          name: tag.name,
          height: tag.height,
        };
      }
      if (tag.name === tags.Level2 && tag.ancestor.includes(parentTag.id)) {
        const val = tag.ancestor;
        val.push(tag.id)
        branches.push(val)
      }
    }
  });
  branches.forEach((branch) => {
    let list = [];
    branch.forEach((el) => {
      list[tagData[el].height] = tagData[el].name;
    });
    const string = list.join("-->")
    console.log(string);
  });
}
createBranch();

