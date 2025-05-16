const User = require("../model/userModel");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-very-strong-and-secret-key-12345";
const JWT_EXPIRES_IN = "1h";

const authController = {
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ message: "Vui lòng cung cấp tên, email và mật khẩu." });
      }
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Mật khẩu phải có ít nhất 6 ký tự." });
      }

      const newUser = await User.create({ name, email, password });
      const { password: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        message: "Người dùng đã đăng ký thành công.",
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Lỗi đăng ký:", error.message);
      if (error.message === "Email đã tồn tại.") {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({
        message: "Có lỗi xảy ra khi đăng ký người dùng.",
        error: error.message,
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Vui lòng cung cấp email và mật khẩu." });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res
          .status(401)
          .json({ message: "Email hoặc mật khẩu không hợp lệ." });
      }

      const isMatch = await User.comparePassword(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Email hoặc mật khẩu không hợp lệ." });
      }
      const tokenPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
      };
      const token = jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });
      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        message: "Đăng nhập thành công.",
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Lỗi đăng nhập:", error.message);
      res.status(500).json({
        message: "Có lỗi xảy ra khi đăng nhập.",
        error: error.message,
      });
    }
  },

  async getMe(req, res) {
    if (!req.user) {
      return res.status(401).json({
        message:
          "Không được phép, không có mã thông báo hoặc mã thông báo không hợp lệ.",
      });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tìm thấy." });
    }
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  },
};

module.exports = authController;
