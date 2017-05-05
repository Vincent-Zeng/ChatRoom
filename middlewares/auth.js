var config = require('../config')
var UserProxy = require('../proxy/user')
exports.genSessionId = function (user, res) {
  let token = user._id
  let options = {
    signed: true,
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 30
  }
  res.cookie(config.auth_cookie_name, token, options)
  return
}

exports.authUser = function (req, res, next) {
  if (req.session.user)  {
    next()
  } else {
    var user_id = req.signedCookies[config.auth_cookie_name]
    if (!user_id) {
      next()
    } else {
      UserProxy.getUserById(user_id,function (err, user) {
        req.session.user = user
        next ()
      })
    }
  }
}
