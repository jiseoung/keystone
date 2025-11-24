const express = require('express');

const register = require('../../services/auth/register.service');

const router = express.Router();

router.get('/register', (req, res) => {
    res.render('auth/register');
});

router.post('/register', async (req, res) => {
    const { id, pw, email, age } = req.body;

    const result = await register(id, pw, email, age);

    if (result.success) {
        return res.status(200).send('<script>alert("Register Success");location.href="/auth/login"</script>');
    }
    else {
        return res.status(400).send('<script>alert("Register Failed");location.href="/auth/register"</script>');
    }
});

module.exports = router;