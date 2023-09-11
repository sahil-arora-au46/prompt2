import { readFileSync, writeFileSync } from "node:fs";
import { textCosineSimilarity } from "./similarity.js";

console.time("functionTime");
const data = readFileSync("./subjectTagsData.json").toString();
const tags = {
  Level1: "Numerical Aptitude",
  Level2: "Speed and Distance",
  Level3: "time, speed and distance",
};

let sameParent = [];
const tagname = {};
const tagtree = {};
const parsedData = JSON.parse(data);
const subjectTagsData = Object.values(parsedData);

let childTag;
let childTag1 = [];
let childTag2 = [];
const similarChildTags = {
  childTag1: {},
  childTag2: {},
};
let tagtreeArr = [];

let parentTag = subjectTagsData.find((el) => {
  if (el.height === 0 && el.name === tags.Level1) {
    return el;
  }
});

subjectTagsData.forEach((el) => {
  if (el.name === tags.Level2 && el.ancestor.includes(parentTag.id)) {
    childTag = el;
    sameParent.push(el);
  } else if (el.name === tags.Level2) {
    childTag1.push(el);
  }
  if (
    el.name.includes(tags.Level2) ||
    (tags.Level2.includes(el.name) && el.ancestor.includes(parentTag.id))
  ) {
    similarChildTags.childTag1[el.name] = el;
  }
});

subjectTagsData.forEach((el) => {
  if (el.name === tags.Level3 && el.ancestor.includes(parentTag.id)) {
    childTag = el;
    sameParent.push(el);
  } else if (el.name === tags.Level3) {
    childTag2.push(el);
  }
  if (
    el.name.includes(tags.Level3) ||
    (tags.Level3.includes(el.name) &&el.ancestor.includes(parentTag.id))
  ) {
    similarChildTags.childTag2[el.name] = el;
  }
});
subjectTagsData.filter((el) => {
  if (childTag) {
    if (el.ancestor) {
      if (
        el.ancestor.includes(parentTag.id) ||
        el.ancestor.includes(childTag.id)
      ) {
        tagname[el.id] = {
          name: el.name,
          height: el.height,
        };

        if (
          el.ancestor.includes(parentTag.id) &&
          el.ancestor.includes(childTag.id) &&
          el.children.length === 0
        ) {
          tagtree[el.id] = el.ancestor;
        }
      }
    }
  }
});
// console.log(`sameParent`, sameParent);
console.log(`parentTag`, parentTag);
console.log("childTag", childTag);
console.log("childTag1",childTag1);
console.log("childTag2",childTag2);
console.log(`similarChildTags`, similarChildTags);
writeFileSync("similartags.json",JSON.stringify(similarChildTags))
// console.log(tagtree)
for (let key in tagtree) {
  let temp = [];
  tagtree[key].forEach((el) => {
    if (el !== parentTag.id && tagname[el].height >= childTag.height) {
      let index = tagname[el].height - childTag.height;
      temp[index] = tagname[el].name;
    } else {
      // console.log(el," not found in tagname")
    }
  });
  temp.push(tagname[key].name);
  tagtreeArr.push(temp);
}

const tree = createTagTreeStructure(tagtreeArr);

function createTagTreeStructure(tagtreeArr) {
  const structuredTagTree = {};

  for (const itemArray of tagtreeArr) {
    let currentLevel = structuredTagTree;

    for (const value of itemArray) {
      if (!currentLevel[value]) {
        currentLevel[value] = {};
      }
      currentLevel = currentLevel[value];
    }
  }
  return structuredTagTree;
}

const stringifiedTree = JSON.stringify(tree);
const sizeInBytes = new TextEncoder().encode(stringifiedTree).length;

console.log(`Approximate size of the object in bytes: ${sizeInBytes}`);

console.timeEnd("functionTime");
