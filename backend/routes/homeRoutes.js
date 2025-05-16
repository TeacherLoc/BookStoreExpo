const express = require('express');
const router = express.Router();
const { profileData, userMyBooksData, categoriesData } = require('../data/mockData');
const { authenticateToken } = require('../middleware/authMiddleware');

// GET /api/home
router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id; // Lấy userId từ middleware xác thực

    // Lọc myBooks dựa trên userId
    const myBooksForUser = userMyBooksData.filter(book => book.userId === userId);

    // Trong thực tế, profileData cũng sẽ được lấy dựa trên userId
    const userProfile = { ...profileData, name: req.user.name };


    res.json({
        profile: userProfile,
        myBooks: myBooksForUser,
        categories: categoriesData // categoriesData có thể là chung cho tất cả user hoặc cũng có thể được cá nhân hóa
    });
});

module.exports = router;