const express = require("express");
const QRCode = require("qrcode");
const router = express.Router();


router.post("/generate", async (req, res, next) => {
  try {
    const {
      data,
      errorCorrectionLevel = "H", 
      version, 
      scale = 10, 
      margin = 4, 
      darkColor = "#000000", 
      lightColor = "#ffffff", 
      format = "png",
    } = req.body;

    if (!data || typeof data !== "string" || !data.trim()) {
      return res.status(400).json({ error: "`data` (text/URL to encode) is required." });
    }

    const options = {
      errorCorrectionLevel,
      margin: Number(margin),
      scale: Number(scale),
      color: {
        dark: darkColor,
        light: lightColor,
      },
    };
    if (version) options.version = Number(version);

    if (format === "svg") {
      const svg = await QRCode.toString(data, { ...options, type: "svg" });
      res.setHeader("Content-Type", "image/svg+xml");
      return res.send(svg);
    }

    const dataUrl = await QRCode.toDataURL(data, options);
    res.json({ image: dataUrl, format: "png" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
