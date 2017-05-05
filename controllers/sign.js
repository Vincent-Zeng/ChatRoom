var User = require('../proxy').User;
var EventProxy = require('eventproxy');
var validator = require('validator');
var crypto = require('crypto');
var authMiddleWare = require('../middlewares/auth')
exports.signUp = function (req, res, next) {
  let loginname = req.body.loginname;
  let email = req.body.email;
  let password = req.body.password;
  let rePassword = req.body.rePassword;
  var ep = new EventProxy();

  function save () {
    var md5 = crypto.createHash('md5');
    var passwordHash = md5.update(password).digest('base64');
    User.newUser(loginname, email, passwordHash, function (err, user) {
      if (err) {
        return nexxt(err);
      }
      let data = {
        status: 200,
        message: '注册成功'
      }
      req.session.user = user;
      res.status(200).json(data);
    })
  }
  ep.fail(next);
  ep.on('signUpErr', function (errMsg) {
    let data = {
      status: 422,
      message: errMsg
    }
    res.status(200).json(data);
  })
  if ([loginname, email, password, rePassword].some(function (item) { return item ===''})) {
    return ep.emit('signUpErr', '信息没有填写完整。');
  }
  if (!validator.isEmail(email)) {
    return ep.emit('signUpErr', '邮箱格式不正确。');
  }
  if (loginname.length < 5) {
    return ep.emit('signUpErr', '用户名长度不能少于5位。');
  }
  if (password !== rePassword) {
    return ep.emit('signUpErr', '确认密码与密码不一致。');
  }

  ep.on('nested', function() {
    User.getUserByEmail(email, function (err, user) {
      if (user) {
        return ep.emit('signUpErr', '邮箱已被使用.');
      }
      save ();
    })
  })

  User.getUserByLoginname(loginname, function (err, user) {
    if (user) {
      return ep.emit('signUpErr', '用户名已被使用.');
    }
    ep.emit('nested');
  })
}

exports.signIn = function (req, res, next) {
  let email = req.body.email;
  let password = req.body.password;
  let md5 = crypto.createHash('md5');
  let passwordHash = md5.update(password).digest('base64');
  let ep = new EventProxy();
  ep.fail(next);
  ep.on("signInErr", function (errMsg) {
    let data = {
      status: 422,
      message: errMsg
    }
    res.status(200).json(data)
  })
  if ([email, password].some(function (item) {return item === ""})) {
    return ep.emit("signInErr", "信息填写不完整");
  }
  User.getUserByEmail(email, function(err, user) {
    console.log("password:" + password)
    if (err) {
      next(err)
    }
    if (!user) {
      return ep.emit("signInErr", "账户不存在。")
    }
    if (user.password === passwordHash) {
      authMiddleWare.genSessionId(user, res);
      req.session.user = user;
      let data = {
        status: 200,
        message: "登录成功"
      };
      res.status(200).json(data);
    } else {
      ep.emit("signInErr", "密码错误。");
    }
  })
}

exports.auth = function (req, res, next) {
  var user = {
    loginname: req.session.user.loginname,
    email: req.session.user.email,
    user_id: req.session.user._id
  }
  res.status(200).json({
    status: 200,
    message: user
  })
}
