const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function search(url) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('li[data-layout="organic"] ');

    const reviews = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('li[data-layout="organic"] ')).map(element => ({
        link: element.querySelector('a[data-testid="result-extras-url-link"]')?.href || "No link available",
        image: element.querySelector('a[data-testid="result-extras-site-search-link"] img')?.src || "No image available",
        title: element.querySelector('a[data-testid="result-title-a"] span')?.textContent.trim() || "No title available",
        description: element.querySelector('div[data-result="snippet"] span')?.textContent.trim() || "No description available",
      }));
    });
 
    return reviews;

  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  } finally {
    await browser.close();
  }
}

app.set("view engine", "ejs");

app.get('/', (req, res) => {
  res.render('search', { result: false, searchresult: [] });
});

app.post('/search', async (req, res) => {
  const searchQuery = req.body.query;
  console.log("Search Query:", searchQuery);

  const url = `https://duckduckgo.com/?t=h_&q=${searchQuery}&ia=web`;
  const searchresult = await search(url);

  res.render('search', { result: true, searchresult });
}); 

app.listen(4000, () => {
  console.log("Server is running on port http://localhost:4000");
});
 