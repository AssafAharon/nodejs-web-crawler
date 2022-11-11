//NOTE: In order to run the process, you should first command "npm i"


const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args)); //For fetching the html pages
const cheerio = require("cheerio"); //For conveniently selecting the proper html tags
const fs = require("fs"); //For writing the result into a local file

const url = process.argv[process.argv.length - 2]; //Getting the website url, for example: https://dribbble.com/tags/simple_website
const depth = Number(process.argv[process.argv.length - 1]); //Getting the depth, for example: 3

const results = []; //For the {imageUrl, sourceUrl, depth} objects

const seenUrls = {}; //For saving already-visited website urls

const isUrlValid = (link) => {   //For visiting 
  return link.startsWith("http");
};

const crawl = async ({ url, currentDepth }) => {
  if (seenUrls[url] || currentDepth === depth) {
    return;
  }

  seenUrls[url] = true;
  const response = await fetch(url);
  const currentPageHTML = await response.text();
  const $ = cheerio.load(currentPageHTML);
  $("img")
    .map((index, img) => img.attribs.src)
    .get()
    .forEach((currentImageUrl) => {
      results.push({
        imageUrl: currentImageUrl,
        sourceUrl: url,
        depth: currentDepth + 1,
      });
    });   //Getting the array of the image urls and putting its values in 'results' array properly

  $("a")
    .map((index, link) => link.attribs.href)
    .get()
    .forEach((currentLink) => {
      if (isUrlValid(currentLink)) {
        crawl({ url: currentLink, currentDepth: currentDepth + 1 }).then(
          (_) => {
            fs.writeFile(
              "results.json",
              JSON.stringify({ results: results }),
              "utf8",
              function (err) {
                if (err) {
                  return console.log(err);
                }
              }
            );
          }
        );
      }
    });   //Going through the proper url links the current link contains and calling 'crawl' function recursively
};

let currentDepth = 0;   //Handling '0' extreme-case
if (depth === 0) {
  currentDepth--;
}

crawl({ url, currentDepth });
