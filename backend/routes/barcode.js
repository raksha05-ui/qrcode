const express = require("express");
const bwipjs = require("bwip-js");
const router = express.Router();


const SUPPORTED_TYPES = {
  ean8: "ean8",
  ean13: "ean13",
  ean14: "itf14", 
  upca: "upca",
  jan: "ean13", 
  isbn10: "isbn",
  isbn13: "isbn",
  issn: "issn",
  code39: "code39",
  code128: "code128",
  pzn: "pzn",
};

router.get("/types", (req, res) => {
  res.json({ types: Object.keys(SUPPORTED_TYPES) });
});

router.post("/generate", async (req, res, next) => {
  try {
    const {
      data,
      type = "code128",
      scale = 3, 
      height = 10, 
      includetext = true,
      textxalign = "center",
      barColor = "000000", 
      backgroundColor = "FFFFFF",
      rotate = "N", 
    } = req.body;

    if (!data || typeof data !== "string" || !data.trim()) {
      return res.status(400).json({ error: "`data` is required." });
    }

    const bcid = SUPPORTED_TYPES[type];
    if (!bcid) {
      return res.status(400).json({
        error: `Unsupported barcode type "${type}". Supported: ${Object.keys(SUPPORTED_TYPES).join(", ")}`,
      });
    }

    const png = await bwipjs.toBuffer({
      bcid,
      text: data,
      scale: Number(scale),
      height: Number(height),
      includetext: Boolean(includetext),
      textxalign,
      barcolor: barColor.replace("#", ""),
      backgroundcolor: backgroundColor.replace("#", ""),
      rotate,
      paddingwidth: 10,
      paddingheight: 10,
    });

    const dataUrl = `data:image/png;base64,${png.toString("base64")}`;
    res.json({ image: dataUrl, type, bcid });
  } catch (err) {
  
    if (typeof err === "string") return res.status(400).json({ error: err });
    next(err);
  }
});

module.exports = router;
