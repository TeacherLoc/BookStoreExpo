const bcrypt = require("bcryptjs");

const users = [];
let userIdCounter = 1;

const User = {
  async findByEmail(email) {
    return users.find((user) => user.email === email);
  },

  async findById(id) {
    return users.find((user) => user.id === id);
  },

  async create(userData) {
    const { name, email, password } = userData;

    if (!name || !email || !password) {
      throw new Error("Tên, email và mật khẩu là bắt buộc.");
    }
    if (await this.findByEmail(email)) {
      throw new Error("Email đã tồn tại.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: userIdCounter++,
      name,
      email,
      password: hashedPassword,
      points: 0,
      myBooks: [],
      bookmarks: new Set(),
    };
    users.push(newUser);
    console.log("Người dùng mới được tạo:", {
      id: newUser.id,
      email: newUser.email,
    });
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },
  findAll() {
    return users.map((u) => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });
  },
};

module.exports = User;
