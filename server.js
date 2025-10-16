import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Set EJS as the template engine
app.set("view engine", "ejs");

// Serve static files (like CSS, JS, images)
app.use(express.static(__dirname));

// Route for home page
app.get("/", (req, res) => {
  res.render("index");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
