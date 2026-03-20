const express = require("express");

const app = express();
const port = 3000;

app.get("/", (_req, res) => {
  res.send("Hello from Node.js Express in Docker Compose (Bai 4)");
});

app.listen(port, () => {
  console.log(`Bai 4 app listening on port ${port}`);
});
