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

const run = async () => {
  const TELEGRAM_BOT_ID = core.getInput("TELEGRAM_BOT_ID");
  const TELEGRAM_CHAT_ID = core.getInput("TELEGRAM_CHAT_ID");

  browser = await puppeteer.launch({
    // headless: false,
    // args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.goto("https://www.epicgames.com/store/en-US/free-games", {
    waitUntil: "networkidle2",
  });
  await page.screenshot({ path: "Image.png" });

  let readStream = fs.createReadStream("./Image.png");

  const formData = new FormData();
  formData.append("photo", readStream);

  //   var formdata = new FormData();
  //   formdata.append(
  //     "photo",
  //     fileInput.files[0],
  //     "/C:/Users/Rajitha Gunathilake/Downloads/photo6179077395177384496.jpg"
  //   );

  //   var requestOptions = {
  //     method: "POST",
  //     body: formdata,
  //     redirect: "follow",
  //   };

  //   fetch("https://api.telegram.org/bot98690c/sendPhoto?chat_id=-407", requestOptions)
  //     .then(response => response.text())
  //     .then(result => console.log(result))
  //     .catch(error => console.log('error', error));

  //   `https://api.telegram.org/bot${TELEGRAM_BOT_ID}/sendPhoto?chat_id=${TELEGRAM_CHAT_ID}
  try {
    let data = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_ID}/sendPhoto?chat_id=${TELEGRAM_CHAT_ID}`,
      //   requestOptions
      {
        method: "POST",
        redirect: "follow",
        // headers: {
        //   "Content-length": fileSizeInBytes,
        // },
        body: formData, //bufferContent,
      }
    ).then((response) => response.json());

    console.log(data);

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
