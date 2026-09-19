const express = require("express");
const multer = require("multer");
const { Jimp } = require("jimp");
const {
  MultiFormatReader,
  DecodeHintType,
  BarcodeFormat,
  RGBLuminanceSource,
  BinaryBitmap,
  HybridBinarizer,
  NotFoundException,
} = require("@zxing/library");


const GenericMultipleBarcodeReader = null;

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function rgbaToArgbInt32(rgbaData, width, height) {
 .
  const size = width * height;
  const argb = new Int32Array(size);
  for (let i = 0, p = 0; i < size; i++, p += 4) {
    const r = rgbaData[p];
    const g = rgbaData[p + 1];
    const b = rgbaData[p + 2];
    argb[i] = (0xff << 24) | (r << 16) | (g << 8) | b;
  }
  return argb;
}

function buildBinaryBitmap(rgbaData, width, height) {
  const argb = rgbaToArgbInt32(rgbaData, width, height);
  const luminanceSource = new RGBLuminanceSource(argb, width, height);
  return new BinaryBitmap(new HybridBinarizer(luminanceSource));
}

function buildReader() {
  const reader = new MultiFormatReader();
  const hints = new Map();
  hints.set(DecodeHintType.TRY_HARDER, true);
  reader.setHints(hints);
  return reader;
}

router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded (field name `image`)." });

    const image = await Jimp.read(req.file.buffer);
    const { width, height } = image.bitmap;
    const rgbaData = new Uint8ClampedArray(image.bitmap.data); 

    const results = [];

    if (GenericMultipleBarcodeReader) {
      try {
        const bitmap = buildBinaryBitmap(rgbaData, width, height);
        const reader = buildReader();
        const multiReader = new GenericMultipleBarcodeReader(reader);
        const multiResults = multiReader.decodeMultiple(bitmap);
        multiResults.forEach((r) => results.push(r));
      } catch (e) {
     
      }
    }

    if (results.length === 0) {
      try {
        const bitmap = buildBinaryBitmap(rgbaData, width, height);
        const reader = buildReader();
        const single = reader.decode(bitmap);
        results.push(single);
      } catch (e) {
        if (!(e instanceof NotFoundException)) {
          console.error("Decode error:", e.message || e);
        }
      }
    }

    if (results.length === 0) {
      return res.json({ codes: [], width, height, message: "No barcode or QR code detected." });
    }

    const codes = results.map((r) => {
      const points = r.getResultPoints().map((p) => ({ x: p.getX(), y: p.getY() }));
      const xs = points.map((p) => p.x);
      const ys = points.map((p) => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);

      return {
        text: r.getText(),
        format: BarcodeFormat[r.getBarcodeFormat()],
        boundingBox: {
          x: Math.max(0, minX - 10),
          y: Math.max(0, minY - 10),
          width: maxX - minX + 20,
          height: maxY - minY + 20,
        },
      };
    });

    res.json({ codes, width, height });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
