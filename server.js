const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   FILE UPLOAD SETUP
========================= */
const storage = multer.diskStorage({
  destination: path.join(__dirname, "public/uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* =========================
   ROUTES
========================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "public/about.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "public/contact.html"));
});

app.get("/admissions", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admissions.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin.html"));
});

/* =========================
   UPLOAD PAPERS
========================= */
app.post("/upload", upload.single("file"), (req, res) => {
  const { grade, term, subject } = req.body;

  const newPaper = {
    grade,
    term,
    subject,
    file: req.file.filename
  };

  const dataPath = path.join(__dirname, "data/papers.json");

  let papers = [];

  if (fs.existsSync(dataPath)) {
    papers = JSON.parse(fs.readFileSync(dataPath));
  }

  papers.push(newPaper);

  fs.writeFileSync(dataPath, JSON.stringify(papers, null, 2));

  res.send("Upload successful");
});

/* =========================
   GET PAPERS
========================= */
app.get("/papers", (req, res) => {
  const dataPath = path.join(__dirname, "data/papers.json");

  if (!fs.existsSync(dataPath)) {
    return res.json([]);
  }

  const data = fs.readFileSync(dataPath);
  res.json(JSON.parse(data));
});

/* =========================
   NEWS SYSTEM
========================= */
app.post("/add-news", (req, res) => {
  const { title, message } = req.body;

  const newsItem = {
    title,
    message,
    date: new Date().toLocaleString()
  };

  const dataPath = path.join(__dirname, "data/news.json");

  let news = [];

  if (fs.existsSync(dataPath)) {
    news = JSON.parse(fs.readFileSync(dataPath));
  }

  news.unshift(newsItem);

  fs.writeFileSync(dataPath, JSON.stringify(news, null, 2));

  res.send("News posted successfully");
});

app.get("/news", (req, res) => {
  const dataPath = path.join(__dirname, "data/news.json");

  if (!fs.existsSync(dataPath)) {
    return res.json([]);
  }

  const data = fs.readFileSync(dataPath);
  res.json(JSON.parse(data));
});

/* =========================
   DELETE NEWS
========================= */
app.post("/delete-news", (req, res) => {
  const { index } = req.body;

  const dataPath = path.join(__dirname, "data/news.json");

  if (!fs.existsSync(dataPath)) {
    return res.send("No news found");
  }

  let news = JSON.parse(fs.readFileSync(dataPath));

  news.splice(index, 1);

  fs.writeFileSync(dataPath, JSON.stringify(news, null, 2));

  res.send("News deleted");
});

/* =========================
   DELETE PAPER
========================= */
app.post("/delete-paper", (req, res) => {
  const { index } = req.body;

  const dataPath = path.join(__dirname, "data/papers.json");

  if (!fs.existsSync(dataPath)) {
    return res.send("No papers found");
  }

  let papers = JSON.parse(fs.readFileSync(dataPath));

  const fileToDelete = papers[index]?.file;

  if (fileToDelete && fs.existsSync(path.join(__dirname, "public/uploads", fileToDelete))) {
    fs.unlinkSync(path.join(__dirname, "public/uploads", fileToDelete));
  }

  papers.splice(index, 1);

  fs.writeFileSync(dataPath, JSON.stringify(papers, null, 2));

  res.send("Paper deleted");
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});