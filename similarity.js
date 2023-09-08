const stopWords = [
  "usually",
  "us",
  "upon",
  "until",
  "under",
  "use",
  "relate",
  "related",
  "relatively",
  "regarding",
  "quite",
  "n",
  "necessary",
  "to",
  "based",
  "than",
  "that",
  "those",
  "this",
  "there",
  "three",
  "o",
  "of",
  "one",
  "or",
  "on",
  "a",
  "after",
  "an",
  "any",
  "and",
  "are",
  "accordingly",
  "among",
  "all",
  "as",
  "vs",
  "v",
  "via",
  "very",
  "versus",
  "k",
  "g",
  "go",
  "b",
  "by",
  "both",
  "but",
  "be",
  "because",
  "between",
  "h",
  "how",
  "w",
  "was",
  "why",
  "what",
  "when",
  "where",
  "while",
  "whose",
  "s",
  "should",
  "said",
  "so",
  "some",
  "such",
  "since",
  "p",
  "l",
  "less",
  "ie",
  "ifs",
  "if",
  "i",
  "is",
  "in",
  "f",
  "from",
  "for",
  "d",
  "did",
  "c",
  "e",
  "eg",
];

function wordCountMap(str) {
  let words = str.split(/[ -/,/]/);
  let wordCount = {};
  words.forEach((w) => {
    // If similarity computation is supposed to be case insensitive
    w = w.toLowerCase();

    //Ignore stop words
    if (stopWords.includes(w)) return;
    wordCount[w] = (wordCount[w] || 0) + 1;
  });
//   console.log(str, wordCount);
  return wordCount;
}

function addWordsToDictionary(wordCountmap, dict) {
  for (let key in wordCountmap) {
    dict[key] = true;
  }
  console.log({ dict });
}

function wordMapToVector(map, dict) {
  let wordCountVector = [];
  for (let term in dict) {
    wordCountVector.push(map[term] || 0);
  }
  console.log(wordCountVector);
  return wordCountVector;
}

function dotProduct(vecA, vecB) {
  let product = 0;
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
}

function magnitude(vec) {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i];
  }
  return Math.sqrt(sum);
}

function cosineSimilarity(vecA, vecB) {
  return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB));
}

function textCosineSimilarity(txtA, txtB) {
  const wordCountA = wordCountMap(txtA);
  const wordCountB = wordCountMap(txtB);
  let dict = {};
  addWordsToDictionary(wordCountA, dict);
  addWordsToDictionary(wordCountB, dict);
  const vectorA = wordMapToVector(wordCountA, dict);
  const vectorB = wordMapToVector(wordCountB, dict);
  const similarity = cosineSimilarity(vectorA, vectorB);
//   console.log(similarity)
  return similarity;
}

function getSimilarityScore(val) {
    return Math.round(val * 100);
}
console.log(textCosineSimilarity("Tissue","plant tissue"))

export {textCosineSimilarity}