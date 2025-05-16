const jwt = require("jsonwebtoken");
// const User = require('../models/userModel');

const JWT_SECRET =
  process.env.JWT_SECRET || "your-very-strong-and-secret-key-12345";

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token =
    authHeader && authHeader.startsWith("Bearer ") && authHeader.split(" ")[1];

  // Xác định xem route hiện tại có phải là route công khai tùy chọn hay không
  const isPotentiallyPublicRoute =
    req.originalUrl.startsWith("/api/home") ||
    req.originalUrl.startsWith("/api/books/");

  if (token) {
    // Có token được cung cấp
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // Người dùng được xác thực (chứa id, name, email từ payload của token)
      console.log(
        `Authenticated user ${req.user.email} for ${req.originalUrl}`
      );
      return next();
    } catch (err) {
      // Token có mặt nhưng không hợp lệ
      console.error(`Invalid token for ${req.originalUrl}: ${err.message}`);
      if (isPotentiallyPublicRoute) {
        // Đối với các route công khai tùy chọn, token không hợp lệ có nghĩa là tiếp tục như khách
        console.log(
          `Invalid token on public route ${req.originalUrl}. Proceeding as guest.`
        );
        if (req.originalUrl.startsWith("/api/home")) {
          // Thiết lập người dùng khách cho /api/home
          req.user = { id: 0, name: "Guest", email: null };
        }
        // Đối với /api/books/, quyền truy cập của khách không nhất thiết phải đặt req.user
        // trừ khi route handler cần nó.
        return next();
      } else {
        // Đối với các route riêng tư, token không hợp lệ là lỗi nghiêm trọng
        return res.status(403).json({ message: "Mã thông báo không hợp lệ." });
      }
    }
  } else {
    // Không có token được cung cấp
    if (isPotentiallyPublicRoute) {
      console.log(`Guest access for ${req.originalUrl}`);
      if (req.originalUrl.startsWith("/api/home")) {
        // Thiết lập người dùng khách cho /api/home
        req.user = { id: 0, name: "Guest", email: null };
      }
      // Đối với /api/books/, quyền truy cập của khách không nhất thiết phải đặt req.user
      return next();
    } else {
      // Không có token cho một route riêng tư -> từ chối truy cập
      return res
        .status(401)
        .json({ message: "Truy cập bị từ chối. Không cung cấp mã thông báo." });
    }
  }
};

module.exports = { authenticateToken };
