const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const qrRoutes = require("./routes/qrcode");
const barcodeRoutes = require("./routes/barcode");
const decodeRoutes = require("./routes/decode");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/qrcode", qrRoutes);
app.use("/api/barcode", barcodeRoutes);
app.use("/api/decode", decodeRoutes);

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`QR/Barcode Studio API running on http://localhost:${PORT}`);
});
