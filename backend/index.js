const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

const path = require("path");
const cors = require("cors");
const connect = require("./connection/index.js");

// Create HTTP server first
const http = require("http");
const server = http.createServer(app);

// Import and initialize Socket.IO (separate file)
const { initSocket } = require("./controller/socket");

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/auth", require("./routes/admin"));      // Admin login/signup
app.use("/admin", require("./routes/admin"));     // Admin APIs
app.use("/store", require("./routes/user"));      // User routes
app.use("/student", require("./routes/student")); // Student routes
app.use("/auth", require("./routes/password"));   // Password reset
app.use("/bulkupload", require("./routes/bulkupload.js"));

// Static file serving
app.use("/:filename", express.static(path.join(__dirname, "./uploads")));

// Database connection
connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to database"))
  .catch((err) => console.log("DB Error:", err));

// Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
initSocket(server);