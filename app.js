const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
app.use("/files", express.static("files"));
require('dotenv').config();
const PORT = process.env.PORT || 5000;
//mongodb connection----------------------------------------------
// Add validation for DB_URL here ⬇️
// if (!process.env.DB_URL) {
//   console.error("FATAL ERROR: DB_URL is not defined in .env file.");
//   process.exit(1);
// }

const mongoUrl = "mongodb+srv://mohammadanamul0000:<db_password>@cluster0.qqheozr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoUrl, { useNewUrlParser: true })
  .then(() => console.log("Connected to database"))
  .catch(e => console.log(e));
//multer------------------------------------------------------------
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./pdfDetails");
const PdfSchema = mongoose.model("PdfDetails");
const upload = multer({ storage: storage });

app.post("/upload-files", upload.single("file"), async (req, res) => {
  console.log(req.file);
  const title = req.body.title;
  const fileName = req.file.filename;
  try {
    await PdfSchema.create({ title: title, pdf: fileName });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-files", async (req, res) => {
  try {
    PdfSchema.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//apis----------------------------------------------------------------
app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});

app.listen(5000, () => {
  console.log("Server Started");
});
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
