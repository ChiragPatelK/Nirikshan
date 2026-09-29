require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/works", require("./routes/works"));
app.use("/api/alerts", require("./routes/alerts"));
app.use("/api/search", require("./routes/search"));
app.use("/api/states", require("./routes/states"));
app.use("/api/vendors", require("./routes/vendors"));
app.use("/api/import", require("./routes/importRoute"));
app.use("/api/chat", require("./routes/chat"));

const DEMO_MODE = process.env.DEMO_MODE !== "false";
app.get("/api/status", (req, res) => {
  res.json({ mode: DEMO_MODE ? "DEMO" : "DATABASE", version: "1.0.0", appName: "NIRIKSHAN AI" });
});

app.listen(PORT, () => {
  console.log(`NIRIKSHAN AI server running on port ${PORT}`);
  console.log(`Mode: ${DEMO_MODE ? "DEMO (prototype data)" : "DATABASE"}`);
});
