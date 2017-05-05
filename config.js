var config = {
  backend_port: 3000,
  frontend_port: 8080,
  origin: 'localhost',
  host: 'http://localhost',
  session_secret: 'secret',
  debug: true,
  db: 'mongodb://127.0.0.1/ChatRoom1',
  auth_cookie_name: 'user_id'
}

module.exports = config;
