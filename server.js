require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL Connection Configuration
const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: "localhost",
  database: "sandbox",
  password: process.env.DB_PASSWORD,
  port: 5432,
});

// Middleware
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Database Initialization

// Routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/add-branch-page", (req, res) => {
  console.log("Serving addBranch.html"); // Added for debugging
  res.sendFile(path.join(__dirname, "addBranch.html"));
});

// API - Authentication
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "ahmed") {
    res.json({ success: true, user: { name: "Admin" } });
  } else {
    res.status(401).json({ error: "Invalid username or password" });
  }
});

// API - Branches
app.get("/api/branches", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, "Branch", "Longitude", "Latitude", tracks FROM iti_branches',
    );
    res.json({
      type: "FeatureCollection",
      features: result.rows.map((b) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [b.Longitude, b.Latitude] },
        properties: b,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/branches/stats", async (req, res) => {
  try {
    const countRes = await pool.query("SELECT COUNT(*) FROM iti_branches");
    const tracksRes = await pool
      .query(
        `
      SELECT trim(unnest(string_to_array(tracks, ','))) as track, count(*) 
      FROM iti_branches 
      WHERE tracks IS NOT NULL AND tracks != ''
      GROUP BY track 
      ORDER BY count DESC
    `,
      )
      .catch(() => ({ rows: [] })); // Fallback if tracks column doesn't exist

    res.json({
      totalBranches: parseInt(countRes.rows[0].count),
      trackDistribution: tracksRes.rows.map((r) => ({
        track: r.track,
        count: parseInt(r.count),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/add-branch", async (req, res) => {
  const { name, tracks, x, y } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO iti_branches ("Branch", tracks, "Longitude", "Latitude", geom) VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($3, $4), 4326)) RETURNING *',
      [name, tracks, x, y],
    );
    res
      .status(201)
      .json({ message: "Branch created successfully", branch: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/branches/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query("DELETE FROM iti_branches WHERE id = $1", [
      id,
    ]);
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Branch not found" });
    res.json({ message: "Branch deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () =>
  console.log(`ITI Branch Viewer running at http://localhost:${PORT}`),
);
