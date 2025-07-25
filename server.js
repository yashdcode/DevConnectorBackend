const express = require("express");
const cors = require("cors");
const connectDB = require("../config/db.js");

const app = express();

connectDB();

const PORT = process.env.PORT || 5000;

// init middleware
app.use(express.json({ extended: false }));

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.get("/", (req, res) => res.send("API is running"));

// Defining Routes
app.use("/api/users", require("../routes/api/user.js"));
app.use("/api/auth", require("../routes/api/auth.js"));
app.use("/api/profile", require("../routes/api/profile.js"));
app.use("/api/post", require("../routes/api/post.js"));

app.listen(PORT, () => console.log(`server started on the PORT: ${PORT}`));
