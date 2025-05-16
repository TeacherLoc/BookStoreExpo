const express = require("express");
const cors = require("cors");
const path = require("path");

const homeRoutes = require("./routes/homeRoutes");
const bookRoutes = require("./routes/bookRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "assets/images")));

// Routes
app.use("/api/home", homeRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes); // Dòng này RẤT QUAN TRỌNG

// Route cơ bản
app.get("/", (req, res) => {
  res.send("BookStore Backend API is running!");
});

// Xử lý lỗi chung (ví dụ)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Có lỗi xảy ra!");
});

app.listen(PORT, () => {
  console.log(`Máy chủ Backend đang chạy trên http://localhost:${PORT}`);
  console.log(
    `Hình ảnh tĩnh được lấy từ: ${path.join(
      __dirname,
      "assets/images"
    )} tại /images`
  );
});
