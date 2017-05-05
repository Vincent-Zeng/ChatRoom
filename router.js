var express = require('express');
var sign = require('./controllers/sign');
var router = express.Router();

router.post('/signup', sign.signUp);
router.post('/signin', sign.signIn);
router.get('/auth', sign.auth);
module.exports = router;
