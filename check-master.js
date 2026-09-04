const sql = require("mssql");
require("dotenv").config();

async function run() {
    try {
        const db = await sql.connect({
            server: process.env.DB_SERVER,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            options: {
                encrypt: false,
                trustServerCertificate: true
            }
        });

        const result = await db.request().query(`
            SELECT
                TABLE_NAME,
                COLUMN_NAME,
                DATA_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'dbo'
              AND TABLE_NAME IN (
                  'MasterData',
                  'MasterDepartments',
                  'MasterDesignations',
                  'MasterLocations'
              )
            ORDER BY TABLE_NAME, ORDINAL_POSITION
        `);

        console.table(result.recordset);
        await db.close();
    } catch (error) {
        console.error("ERROR:", error.message);
    }
}

run();
