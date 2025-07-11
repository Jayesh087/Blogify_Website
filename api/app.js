require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const serverless = require("serverless-http");
const cookieParser = require("cookie-parser");

const Blog = require("../models/blog");
const userRoute = require("../routes/user");
const blogRoute = require("../routes/blog");
const cloudinaryRoute = require("../routes/cloudinary");
const { checkForAuthenticationCookie } = require("../middlewares/authentication");

const app = express();

// MongoDB connection
mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Middleware & config
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.join(__dirname, "../public"))); // ✅ Corrected

// Routes
app.use("/cloudinary", cloudinaryRoute);
app.use("/user", userRoute);
app.use("/blog", blogRoute);

// Home route
app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

// Export for Vercel
module.exports = app;
module.exports.handler = serverless(app);
