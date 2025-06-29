const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
const fs = require("fs"); // Add filesystem module
const path = require("path"); // Add path module

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "files");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/files", express.static(uploadDir));

require('dotenv').config();
const PORT = process.env.PORT || 5000;

// MongoDB connection validation
if (!process.env.DB_URL) {
  console.error("FATAL ERROR: DB_URL is not defined in .env file.");
  process.exit(1);
}

const mongoUrl = process.env.DB_URL;

mongoose.connect(mongoUrl, { 
  useNewUrlParser: true,
  useUnifiedTopology: true // Add recommended option
})
  .then(() => console.log("Connected to database"))
  .catch(e => console.log(e));

// Multer configuration
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Use validated directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Keep file extension
  },
});

require("./pdfDetails");
const PdfSchema = mongoose.model("PdfDetails");
const upload = multer({ storage: storage });

// File upload endpoint
app.post("/upload-files", upload.single("file"), async (req, res) => {
  try {
    const title = req.body.title;
    const fileName = req.file.filename;
    await PdfSchema.create({ title, pdf: fileName });
    res.send({ status: "ok" });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Get files endpoint
app.get("/get-files", async (req, res) => {
  try {
    const data = await PdfSchema.find({});
    res.send({ status: "ok", data });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Server is running successfully!");
});

// Fix: Remove duplicate app.listen calls
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});