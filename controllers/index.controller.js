const express = require('express');

const { verify } = require('../services/token.service');

const router = express.Router();

router.get('/', async (req, res) => {
    let isLoggedIn = false;
    let user = null;

    try {
        const token = req.cookies?.token;
        if (token) {
            user = await verify(token);
            isLoggedIn = true;
        }
    } catch (error) {
        // 토큰 검증 실패 시 로그인 상태를 false로 유지
        isLoggedIn = false;
    }

    res.render('index', {
        isLoggedIn,
        user,
    });
});

module.exports = router;
