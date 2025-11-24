const express = require('express');

const register = require('../../services/auth/register.service');

const router = express.Router();

router.get('/register', (req, res) => {
    res.render('auth/register');
});

router.post('/register', async (req, res) => {
    const { id, pw, email, age } = req.body;

    if (!id || typeof id !== 'string') {
        return res.status(400).send('<script>alert("id를 다시 입력해주세요.");location.href="/auth/register"</script>');
    }

    if (!pw || typeof pw !== 'string') {
        return res.status(400).send('<script>alert("pw를 다시 입력해주세요.");location.href="/auth/register"</script>');
    }

    if (!email || typeof email !== 'string') {
        return res.status(400).send('<script>alert("이메일을 다시 입력해주세요.");location.href="/auth/register"</script>');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).send('<script>alert("올바른 이메일 형식이 아닙니다.");location.href="/auth/register"</script>');
    }

    const parsedAge = Number.parseInt(age, 10);
    if (!Number.isInteger(parsedAge) || parsedAge < 1) {
        return res.status(400).send('<script>alert("나이를 올바르게 입력해주세요.");location.href="/auth/register"</script>');
    }

    const result = await register(id.trim(), pw, email.trim(), parsedAge);

    if (result.success) {
        return res.status(200).send('<script>alert("회원가입 성공");location.href="/auth/login"</script>');
    }
    else {
        return res.status(400).send('<script>alert("회원가입 실패");location.href="/auth/register"</script>');
    }
});

module.exports = router;
