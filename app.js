var config = require('./config');
var router = require("./router");
var auth = require('./middlewares/auth');
// var requestLog          = require('./middlewares/request_log');
var logger              = require("./common/logger");

require('colors');  //给控制台输出加上颜色。
var express             = require("express");
var errorhandler        = require('errorhandler');
var session             = require('express-session');
var MongoStore = require('connect-mongo')(session);
var compress            = require('compression');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var socketServer = require('./controllers/socketserver')

app.use(cors({
  origin:['http://localhost:8080','http://192.168.0.4:8080'],
  credentials: true
}));

// Request logger 请求时间
// app.use(requestLog);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

var cookieParser = require('cookie-parser')(config.session_secret);
app.use(cookieParser);
app.use(compress());


var sessionMiddleware = session({
  secret: config.session_secret,
  store: new MongoStore({
    url: config.db
  }),
  resave: true,
  saveUninitialized: true,
})
app.use(sessionMiddleware);

// 验证用户是否登录
app.use(auth.authUser);

app.use('/', router);   //路由控制

// error handler
if (config.debug) {
    app.use(errorhandler());
} else {
    app.use(function (err, req, res, next) {
        console.error('server 500 error:', err);
        return res.status(500).send('500 status');
    });
}

// 配置socket.io
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(config.backend_port, function () {
    logger.log("ChatRoom listening on port %d", config.backend_port);
    logger.log("You can debug your app with http://" + config.host + ':' + config.backend_port);
    logger.log("");
});

io.use(function(socket, next) {   //这是一个适配器函数，让socket.io可以使用 express的session中间件 为socket.io的中间件。
    sessionMiddleware(socket.request, socket.request.res, next);   //使用这个中间件函数绑定session到socket.request上
});
/*******
namespace.use(fn)
	•	fn (Function)
Registers a middleware, which is a function that gets executed for every incoming Socket,
and receives as parameters the socket and a function to optionally defer execution to the next registered middleware.
********/

socketServer.chat(io);

module.exports = app;
