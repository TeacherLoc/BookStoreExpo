const express = require("express");
const router = express.Router();
let { userMyBooksData, userBookmarks, allBooks } = require("../data/mockData"); // dùng let để có thể thay đổi
const { authenticateToken } = require("../middleware/authMiddleware");

// POST /api/user/books/:bookId/bookmark
router.post("/books/:bookId/bookmark", authenticateToken, (req, res) => {
  const bookId = parseInt(req.params.bookId);
  const userId = req.user.id;

  if (!allBooks.find((b) => b.id === bookId)) {
    return res.status(404).json({ message: "Không tìm thấy sách" });
  }

  if (!userBookmarks[userId]) {
    userBookmarks[userId] = new Set();
  }

  let isBookmarked;
  if (userBookmarks[userId].has(bookId)) {
    userBookmarks[userId].delete(bookId);
    isBookmarked = false;
  } else {
    userBookmarks[userId].add(bookId);
    isBookmarked = true;
  }
  console.log(
    `người dùng ${userId} đánh dấu cho sách ${bookId}:`,
    userBookmarks[userId]
  );
  res.json({ bookId, isBookmarked });
});

// POST /api/user/books/:bookId/start-reading
router.post("/books/:bookId/start-reading", authenticateToken, (req, res) => {
  const bookId = parseInt(req.params.bookId);
  const userId = req.user.id;

  const bookToAdd = allBooks.find((b) => b.id === bookId);
  if (!bookToAdd) {
    return res.status(404).json({ message: "Không tìm thấy sách" });
  }

  let userBookEntry = userMyBooksData.find(
    (ub) => ub.id === bookId && ub.userId === userId
  );

  if (userBookEntry) {
    // Nếu sách đã có, cập nhật lastRead
    userBookEntry.lastRead = new Date().toISOString();
  } else {
    // Nếu sách chưa có, thêm mới vào myBooks
    userBookEntry = {
      ...bookToAdd,
      userId: userId,
      completion: "0%",
      lastRead: new Date().toISOString(),
    };
    userMyBooksData.push(userBookEntry);
  }
  console.log(
    `Người dùng ${userId} bắt đầu/cập nhật đọc sách ${bookId}:`,
    userBookEntry
  );
  res.status(201).json({
    message: "Trạng thái đọc sách đã được cập nhật.",
    userBook: userBookEntry,
  });
});

// PUT /api/user/my-books/:bookId/progress
router.put("/my-books/:bookId/progress", authenticateToken, (req, res) => {
  const bookId = parseInt(req.params.bookId);
  const userId = req.user.id;
  const { completion } = req.body; // Chỉ nhận completion, lastReadTimestamp sẽ tự động cập nhật

  if (typeof completion === "undefined") {
    return res.status(400).json({ message: "Cần có tỷ lệ hoàn thành." });
  }

  const bookIndex = userMyBooksData.findIndex(
    (b) => b.id === bookId && b.userId === userId
  );

  if (bookIndex === -1) {
    return res
      .status(404)
      .json({ message: "Không tìm thấy sách trong danh sách của người dùng." });
  }

  userMyBooksData[bookIndex].completion = completion;
  userMyBooksData[bookIndex].lastRead = new Date().toISOString();
  console.log(
    `Người dùng ${userId} đã cập nhật tiến độ đọc sách ${bookId}:`,
    userMyBooksData[bookIndex]
  );

  res.json({
    message: "Trạng thái đọc sách đã được cập nhật.",
    userBook: userMyBooksData[bookIndex],
  });
});

module.exports = router;
