const mysql = require ('mysql2/promise')
const mysqlPool = mysql.createPool({
    host:'localhost',
    user:'root',
    password:'Coenraad71$',
    database:'fleetmanager'
})



module.exports = mysqlPool
