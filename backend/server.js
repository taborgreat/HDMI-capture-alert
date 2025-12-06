const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const upload = multer();

let lastImage = null;
let alertActive = false;
let lastDiff = 0;
let lastTimestamp = null;

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

async function sendDiscordMessage(message) {
  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
  } catch (err) {
    console.error("Discord error:", err.message);
  }
}

async function diffImages(img1, img2) {
  const resized1 = sharp(img1).resize(100, 100).greyscale();
  const resized2 = sharp(img2).resize(100, 100).greyscale();

  const [d1, d2] = await Promise.all([
    resized1.raw().toBuffer(),
    resized2.raw().toBuffer(),
  ]);

  let sum = 0;
  for (let i = 0; i < d1.length; i++) {
    const delta = d1[i] - d2[i];
    sum += delta * delta;
  }

  return Math.sqrt(sum / d1.length);
}

app.post("/refresh", upload.single("file"), async (req, res) => {
  try {
    const newImage = req.file.buffer;
    let changed = false;

    if (lastImage) {
      lastDiff = await diffImages(lastImage, newImage);
      if (lastDiff > 10) {
        alertActive = true;
        changed = true;

        sendDiscordMessage(
          `Something is happening!\n
          https://w.tabors.site/image/latest.jpg`
        );
      }
    }

    lastImage = newImage;
    lastTimestamp = new Date().toISOString();

    fs.writeFileSync("./image/latest.jpg", newImage);

    res.json({
      ok: true,
      alertActive,
      changed,
      diff: lastDiff,
      timestamp: lastTimestamp,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/status", (req, res) => {
  res.json({
    alertActive,
    diff: lastDiff,
    timestamp: lastTimestamp,
  });
});

app.post("/ack", (req, res) => {
  alertActive = false;
  res.json({ ok: true });
});

app.use("/image", express.static("./image"));

const distPath = path.join(__dirname, "..", "frontend", "dist");

//serve react assets
app.use("/ui", express.static(distPath));
app.use("/assets", express.static(path.join(distPath, "assets")));

app.get("/ui", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(9669, () => {
  console.log("Server listening on port 9669");
});
