import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { textCosineSimilarity } from "./similarity.js";

console.time("functionTime");
const data = readFileSync("./subjectTagsData.json").toString();
// const tags = {
//     Level1: 'Mathematics',
//     Level2: 'geometry',
//     Level3: 'circles'
//   }
let tags;

const parsedData = JSON.parse(data);
const subjectTagsData = Object.values(parsedData);

let parentTag; //Level1 tag
let childTag = []; //Level2 tag with Level1 as Parent
let grandChildTag = []; //Level3 tag with Level1 as Parent
const similarChildTags = []; //similar child with level1 as parent
let childTag1 = []; //similar level2 tags without level1 as parent
let childTag2 = []; //similar level3 tags without level1 as parent
let tree = [];
let treeArray = [];

export function createTagTree(tag) {
  tags = tag;
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
  extractChildTags();

  if (parentTag) {
    const mainChild = findChildTag(); //child with parent as Level1
    if (mainChild.length !== 0) {
      console.log("main", mainChild);
      createTree(mainChild);
    } else if (childTag1.length !== 0 && childTag2.length !== 0) {
      const relatedChild = checkLevel2AndLevel3Relation();
      if (relatedChild.length !== 0) {
        console.log(`relatedChild`, relatedChild);
        createTree(relatedChild);
      } else {
        createTree(parentTag);
      }
    } else {
      createTree(parentTag);
    }
  } else {
    console.log("----------------------LEVEL1 NOT FOUND-----------------");
    if (childTag1.length !== 0 && childTag2.length !== 0) {
      const relatedChild = checkLevel2AndLevel3Relation();
      console.log(`relatedChild`, relatedChild);
      if (relatedChild.length !== 0) {
        createTree(relatedChild);
      }
    } else {
      console.log(
        "-----------------------------------NO CHILD FOUND---------------------------------------"
      );
    }
  }
  checktree();
  const finalTree = returnFinalTree();
  return finalTree;
}

//Level2 and Level3 tags are matched from Tag store
function extractChildTags() {
  if (tags.Level2) {
    subjectTagsData.forEach((tag) => {
      if (tag.ancestor) {
        tag.name = tag.name.toLowerCase();
        //childtag with level1 as parent
        if (parentTag && tag.ancestor.includes(parentTag.id)) {
          //finding exact matches
          if (tag.name === tags.Level2) {
            childTag.push(tag);
          }
          //finding Similar matches
          else {
            const similarity = textCosineSimilarity(tags.Level2, tag.name);
            if (similarity > 0.8) {
              similarChildTags.push(tag);
            }
          }
        }
        // child tag without Level1 as parent
        if (tag.name.includes(tags.Level2)) {
        }
        childTag1.push(tag);
      }
    });
  }

  if (tags.Level3) {
    subjectTagsData.forEach((tag) => {
      tag.name = tag.name.toLowerCase();
      if (tag.ancestor) {
        if (parentTag && tag.ancestor.includes(parentTag.id)) {
          if (tag.name === tags.Level3) {
            grandChildTag.push(tag);
          } else {
            const similarity = textCosineSimilarity(tags.Level3, tag.name);
            if (similarity > 0.8) {
              similarChildTags.push(tag);
            }
          }
        }
        if (tag.name.includes(tags.Level3)) {
          childTag2.push(tag);
        }
      }
    });
  }
  console.log(`parentTag`, parentTag);
  console.log(`childTag`, childTag);
  console.log("grand child ", grandChildTag);
  // console.log("childTag1", childTag1);
  // console.log("childTag2", childTag2);
  console.log(`similarChildTags`, similarChildTags);
}

//function to decide final child tag.
function findChildTag() {
  if (grandChildTag.length !== 0) {
    if (childTag.length !== 0) {
      const filtered = grandChildTag.filter((el) => {
        const found = childTag.find((ele) => {
          if (el.ancestor.includes(ele.id)) {
            return ele;
          }
        });
        if (found) {
          return el;
        }
      });
      if (filtered.length !== 0) return filtered;
    }
    return grandChildTag;
  } else if (childTag.length !== 0) {
    return childTag;
  } else if (similarChildTags.length !== 0) {
    return similarChildTags;
  }
  return [];
}

function checkLevel2AndLevel3Relation() {
  let exactChild = [];
  const similarTags = {};
  childTag2.forEach((el) => {
    childTag1.forEach((ele) => {
      if (el.ancestor.includes(ele.id)) {
        similarTags[el.name] = el;
        if (ele.name === tags.Level2 && el.name === tags.Level3) {
          exactChild.push(el);
        }
      }
    });
  });
  return exactChild;
}

function createTree(mainChild) {
  if (Array.isArray(mainChild)) {
    writeFileSync("./tagtree.txt", "");
    mainChild.forEach((child) => {
      const tagtreeArr = createTagTreeData(child);
      treeArray.push(tagtreeArr);
      tree = createTagTreeStructure(tagtreeArr);
      appendFileSync("./tagtree.txt", `${JSON.stringify(tree)}\n`);
    });
  } else {
    if (mainChild.children.length === 0) {
      console.log(`no deep tags ${mainChild.id}`);
      return;
    }
    const tagtreeArr = createTagTreeData(mainChild);
    treeArray.push(tagtreeArr);
    tree = createTagTreeStructure(tagtreeArr);
    writeFileSync("./tagtree.txt", JSON.stringify(tree));
  }
}

//extracting data needed to create tag tree
function createTagTreeData(childTag) {
  let tagtreeArr = [];
  const tagname = {};
  const tagtree = {};

  subjectTagsData.forEach((el) => {
    if (el.ancestor) {
      //tags which includes parent tag and child tag as their ancestor
      if (el.ancestor.includes(childTag.id) || el.id === childTag.id) {
        tagname[el.id] = {
          name: el.name,
          height: el.height,
        };

        // extracing ancestors of leaf node which includes parent tag and child tag  as its ancestor
        if (el.children.length === 0) {
          tagtree[el.id] = el.ancestor;
        }
      }
    }
  });
  //arraning all ancestor in order in array according to their height.
  for (let key in tagtree) {
    let temp = [];
    tagtree[key].forEach((el) => {
      if (tagname[el]) {
        if (tagname[el].height >= childTag.height) {
          let index = tagname[el].height - childTag.height;
          temp[index] = tagname[el].name;
        } else {
          console.log(el, " not found in tagname");
        }
      }
    });
    if (childTag.height === 0) {
      temp[0] = childTag.name;
    }
    temp.push(tagname[key].name);
    tagtreeArr.push(temp);
  }
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

function checktree() {
  const tree = readFileSync("./tagtree.txt").toString();
  if (tree.length < 3000) {
    return;
  }
  treeArray = trimTagTree();
  writeFileSync("./tagtree.txt", "");

  treeArray.forEach((tree) => {
    const data = createTagTreeStructure(tree);
    appendFileSync("./tagtree.txt", `${JSON.stringify(data)}\n`);
  });
  checktree();
  return;
}

function trimTagTree() {
  treeArray.forEach((tree) => {
    tree.forEach((branch) => {
      if (branch.length > 8) {
        branch.splice(branch.length - 2, 2);
      } else if (branch.length >= 2) {
        branch.splice(branch.length - 1, 1);
      }
    });
  });
  return treeArray;
}

function returnFinalTree() {
  const tempdata = readFileSync("./tagtree.txt").toString();
  const stringifiedTree = JSON.stringify(tempdata);
  return tempdata;
}

console.timeEnd("functionTime");