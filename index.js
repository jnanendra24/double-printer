const { splitPdf } = require("./splitPdf");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();

app.use(cors());
app.use(express.json());
app.set("view engine", "ejs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in the 'uploads/' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/split", upload.single("input"), async (req, res) => {
  splitPdf(req.file.path);
  fs.unlink(req.file.path, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
      return res.status(500).send("Error deleting file");
    }
  });
  res.json({ even: "even_pages.pdf", odd: "odd_pages.pdf" });
});

app.get("/even", (req, res) => {
  res.download("even_pages.pdf", (err) => {
    if (err) {
      console.error("Error sending file:", err);

      // Only send the error response if headers have NOT been sent
      if (!res.headersSent) {
        res.status(500).send("Error downloading file");
      }
    }
  });
});

app.get("/odd", (req, res) => {
  res.download("odd_pages.pdf", (err) => {
    if (err) {
      console.error("Error sending file:", err);

      // Only send the error response if headers have NOT been sent
      if (!res.headersSent) {
        res.status(500).send("Error downloading file");
      }
    }
  });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
