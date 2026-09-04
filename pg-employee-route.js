const { getPG } = require("./pg-db");

async function pgEmployeeRoute(req, res) {
    try {
        const db = await getPG();

        const result = await db.query(`
            SELECT
                "ID",
                "EMP_CODE",
                "SAP_CODE",
                "EMP_NAME",
                "DOMAIN_ID",
                "EMAIL",
                "MOBILE_NO",
                "PHONE_NO",
                "DEPARTMENT",
                "DESIGNATION",
                "CREATED_AT"
            FROM "Employees"
            ORDER BY "ID" DESC
        `);

        res.render("employees", {
            employees: result.rows
        });

    } catch (error) {
        console.error("Neon Employee Error:", error);

        res.status(500).send(
            "Neon Employee Database Error: " + error.message
        );
    }
}

module.exports = pgEmployeeRoute;