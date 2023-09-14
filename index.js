import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { textCosineSimilarity } from "./similarity.js";

console.time("functionTime");
const data = readFileSync("./subjectTagsData.json").toString();
const tags = {
  Level1: "Mathematics",
  Level2: "Coordinate Geometry",
  Level3: "Circle",
};
for (let level in tags) {
  tags[level] = tags[level].toLowerCase();
}

const parsedData = JSON.parse(data);
const subjectTagsData = Object.values(parsedData);

let parentTag;
let childTag = [];
let grandChildTag = [];
let childTag1 = [];
let childTag2 = [];
const similarChildTags = {};
let tree = {};

function main() {
  parentTag = subjectTagsData.find((el) => {
    if (el.height === 0 && el.name.toLowerCase() === tags.Level1) {
      return el;
    }
  });
  extractChildTags();
  const mainChild = findChildTag();
  console.log("mainchild :", mainChild);
  if (mainChild) {
    if (Array.isArray(mainChild)) {
      writeFileSync("./tagtree.txt", "");
      mainChild.forEach((child) => {
        const tagtreeArr = createTagTreeData(child);
        tree = createTagTreeStructure(tagtreeArr);
        // console.log(`tree`, tagtreeArr);
        appendFileSync("./tagtree.txt", `${JSON.stringify(tree)}\n`);
      });
    } else {
      if (mainChild.children.length === 0) {
        console.log("no deep tags");
      }
      const tagtreeArr = createTagTreeData(mainChild);
      tree = createTagTreeStructure(tagtreeArr);
      writeFileSync("./tagtree.txt", JSON.stringify(tree));
    }
  } else {
    console.log(
      "-----------------------------------NO CHILD FOUND----------------------------------"
    );
  }
}
main();

//Level2 and Level3 tags are matched from Tag store
function extractChildTags() {
  if (tags.Level2) {
    subjectTagsData.forEach((el) => {
      if (el.ancestor) {
        el.name = el.name.toLowerCase();
        //finding exact matches
        if (el.name === tags.Level2 && el.ancestor.includes(parentTag.id)) {
          childTag.push(el);
        } else if (el.name.includes(tags.Level2)) {
          childTag1.push(el);
        }
        //finding Similar matches
        if (
          (el.name.includes(tags.Level2) || tags.Level2.includes(el.name)) &&
          el.ancestor.includes(parentTag.id)
        ) {
          similarChildTags[el.name] = el;
        }
      }
    });
  }

  if (tags.Level3) {
    subjectTagsData.forEach((el) => {
      el.name = el.name.toLowerCase();
      if (el.ancestor) {
        if (el.name === tags.Level3 && el.ancestor.includes(parentTag.id)) {
          grandChildTag.push(el);
        } else if (el.name.includes(tags.Level3)) {
          childTag2.push(el);
        }
        if (
          (el.name.includes(tags.Level3) || tags.Level3.includes(el.name)) &&
          el.ancestor.includes(parentTag.id)
        ) {
          similarChildTags[el.name] = el;
        }
      }
    });
  }
}

//function to decide final child tag.
function findChildTag() {
  if (grandChildTag.length !== 0) {
    console.log("hello");
    if(childTag.length !== 0){
      const filtered =grandChildTag.filter((el)=>{
         const found = childTag.find((ele)=>{
          if(el.ancestor.includes(ele.id)) return ele
        })
        if(found){
          return el
        }
      })
      if(filtered) return filtered
      
    }
    return grandChildTag;
  } else if (childTag.length !== 0) {
    return childTag;
  } else {
    //If no exact matches found
    const tag = findSimilarChild(similarChildTags, tags);
    return tag;
  }
}

// finding the  similar child of Level1 tag
function findSimilarChild(similarChildTags, tags) {
  let max1 = 0.4,
    max2 = 0.4;
  let level2tag, level3tag;
  for (let key in similarChildTags) {
    if (tags.Level2) {
      const level2Score = textCosineSimilarity(
        similarChildTags[key].name,
        tags.Level2
      );
      console.log(`level2Score`, level2Score, similarChildTags[key].name);
      if (level2Score > max1) {
        level2tag = similarChildTags[key];
        max1 = level2Score;
      }
    }
    if (tags.Level3) {
      const level3Score = textCosineSimilarity(
        similarChildTags[key].name,
        tags.Level3
      );
      console.log(`level3Score`, level3Score, similarChildTags[key].name);

      if (level3Score > max2) {
        console.log(similarChildTags[key].name, level3Score);
        level3tag = similarChildTags[key];
        max2 = level3Score;
      }
    }
  }
  if (level2tag && level3tag) {
    if (level3tag.ancestor.includes(level2tag.id)) {
      return level3tag;
    } else if (max1 > max2) {
      return level2tag;
    } else if (max2 >= max1) {
      return level3tag;
    }
  } else if (level3tag) {
    return level3tag;
  } else if (level2tag) {
    return level2tag;
  }
}

//extracting data needed to create tag tree
function createTagTreeData(childTag) {
  let tagtreeArr = [];
  const tagname = {};
  const tagtree = {};
  console.log("CHILD : ", childTag);

  subjectTagsData.forEach((el) => {
    if (el.ancestor) {
      //tags which includes parent tag and child tag as their ancestor
      if (
        el.ancestor.includes(parentTag.id) ||
        el.ancestor.includes(childTag.id)
      ) {
        tagname[el.id] = {
          name: el.name,
          height: el.height,
        };

        // extracing ancestors of leaf node which includes parent tag and child tag  as its ancestor
        if (
          el.ancestor.includes(parentTag.id) &&
          el.ancestor.includes(childTag.id) &&
          el.children.length === 0
        ) {
          tagtree[el.id] = el.ancestor;
        }
      }
    }
  });
  //arraning all ancestor in order in array according to their height.
  for (let key in tagtree) {
    let temp = [];
    tagtree[key].forEach((el) => {
      if (el !== parentTag.id && tagname[el].height >= childTag.height) {
        let index = tagname[el].height - childTag.height;
        temp[index] = tagname[el].name;
        // console.log(`tagname[el].height`, tagname[el].height);
      } else {
        // console.log(el," not found in tagname")
      }
    });
    temp.push(tagname[key].name);
    tagtreeArr.push(temp);
  }
  console.log(`tagtreeArr.length`, tagtreeArr.length);
  return tagtreeArr;
}

// creating object of tag in tree structure.
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

console.log(`parentTag`, parentTag);
console.log("childTag", childTag);
console.log("grand child ", grandChildTag);
console.log("childTag1", childTag1);
console.log("childTag2", childTag2);
// console.log(`similarChildTags`, similarChildTags);
writeFileSync("similartags.json", JSON.stringify(similarChildTags));
// console.log(tagtree)

const tempdata = readFileSync("./tagtree.txt");
const stringifiedTree = JSON.stringify(tempdata);
const sizeInBytes = new TextEncoder().encode(stringifiedTree).length;

console.log(`Approximate size of the tree in bytes: ${sizeInBytes}`);

console.timeEnd("functionTime");


