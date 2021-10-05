const sql = require('mssql')

module.exports.sqlConfig = {
    user: 'KillerBeeSU',
    password: 'H?xG6MSaoTXQec!k',
    database: 'KillerBeeDB',
    server: 'killerbee-sql.database.windows.net',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true, // for azure
        trustServerCertificate: false // change to true for local dev / self-signed certs
    }
}
