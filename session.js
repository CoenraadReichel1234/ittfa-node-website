const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const sessionStore = new MySQLStore({
  host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
});

const sessionConfig = {
  secret: 'Coenraad71ITTFA',
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
    secure: false, // set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000, // expire sessions after 24 hours
  },
};

module.exports = sessionConfig;
