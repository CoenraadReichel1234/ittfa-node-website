const mysql = require('mysql2/promise');

const mysqlPool = mysql.createPool({
    host: 'monorail.proxy.rlwy.net',
    user: 'root',
    password: 'rLperAKkADurKtrvRiMCroBMULVQbAlS',
    database: railway,
    port: 40490
});

module.exports = mysqlPool;
