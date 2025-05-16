const express = require("express");
const router = express.Router();
const { allBooks } = require("../data/mockData");
const { authenticateToken } = require("../middleware/authMiddleware");
const User = require("../model/userModel");

// GET /api/books/:bookId
router.get("/:bookId", authenticateToken, async (req, res) => {
  try {
    const bookId = parseInt(req.params.bookId);
    const book = allBooks.find((b) => b.id === bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    let isBookmarked = false;

    // Chỉ kiểm tra bookmark nếu người dùng đã được xác thực (có req.user và không phải guest)
    if (req.user && req.user.id && req.user.id !== 0) {
      // Giả sử User model có phương thức hoặc thuộc tính để kiểm tra bookmarks
      const dbUser = await User.findById(req.user.id); // Lấy thông tin người dùng đầy đủ từ "DB"
      if (dbUser && dbUser.bookmarks && dbUser.bookmarks.has(bookId)) {
        isBookmarked = true;
      }
    }
    // Nếu req.user không tồn tại, hoặc là guest (req.user.id === 0), isBookmarked sẽ là false

    // Đảm bảo bookCover có đường dẫn đầy đủ nếu cần
    const bookData = {
      ...book,
      // bookCover: book.bookCover.startsWith('http') ? book.bookCover : `${req.protocol}://${req.get('host')}${book.bookCover}`, // Nếu bookCover là tương đối
      isBookmarked,
    };

    res.json(bookData);
  } catch (error) {
    // Log lỗi chi tiết hơn
    console.error(
      `Error in GET /api/books/${req.params.bookId}:`,
      error.message,
      error.stack
    );
    res
      .status(500)
      .json({ message: "Lỗi máy chủ nội bộ khi lấy chi tiết sách." });
  }
});

module.exports = router;
