const express = require('express');
const { generate } = require('../../services/token.service');

const login = require('../../services/auth/login.service');

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('auth/login');
});

router.post('/login', async (req, res) => {
    const { id, pw } = req.body;

    const result = await login(id, pw);

    if (result.success) {
        const token = await generate(result.id, result.age);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            maxAge: 60 * 60 * 1000,
        });

        return res.status(200).send('<script>alert("Login Success");location.href="/ai/chat"</script>');
    }
    else {
        return res.status(400).send('<script>alert("Login Failed");location.href="/auth/login"</script>');
    }
})

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    return res.status(200).send('<script>alert("Logout Success");location.href="/"</script>');
});

module.exports = router;
