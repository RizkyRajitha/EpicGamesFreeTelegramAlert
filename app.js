// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality

const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
const core = require("@actions/core");
const fs = require("fs");
const FormData = require("form-data");

// add stealth plugin and use defaults (all evasion techniques)
// const StealthPlugin = require("puppeteer-extra-plugin-stealth");

// puppeteer.use(StealthPlugin());

let browser;

const TELEGRAM_BOT_ID = process.env.TELEGRAM_BOT_ID;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const run = async () => {
  browser = await puppeteer.launch({
    // headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.goto("https://www.epicgames.com/store/en-US/free-games", {
    waitUntil: "networkidle2",
  });
  await page.screenshot({ path: "Image.png" });

  let readStream = fs.createReadStream("./Image.png");

  const formData = new FormData();
  formData.append("photo", readStream);

  try {
    let data = await fetch(
      `https://api.telegram.org/${TELEGRAM_BOT_ID}/sendPhoto?chat_id=${TELEGRAM_CHAT_ID}`,

      {
        method: "POST",
        redirect: "follow",

        body: formData,
      }
    ).then((response) => response.json());

    if (data.ok) {
      core.debug("success ✅");
    } else {
      core.debug("failed 🔴");
      core.setFailed(data.description);
    }
  } catch (error) {
    console.log(error);
  }

  await browser.close();
};

run();
