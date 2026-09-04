require("dotenv").config();
const sql = require("mssql");

async function main() {
    const type = process.argv[2];

    if (!["employee", "phone", "switch"].includes(type)) {
        console.log("Invalid delete type.");
        process.exit(1);
    }

    const config = {
        server: process.env.DB_SERVER,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        options: {
            encrypt: String(process.env.DB_ENCRYPT).toLowerCase() === "true",
            trustServerCertificate:
                String(process.env.DB_TRUST_SERVER_CERTIFICATE).toLowerCase() === "true"
        }
    };

    try {
        const pool = await sql.connect(config);

        if (type === "employee") {

            // Employee related mapping first
            const tables = [
                "EmployeePhoneMapping"
            ];

            for (const table of tables) {
                try {
                    await pool.request().query(`DELETE FROM dbo.${table}`);
                    console.log(`${table}: deleted`);
                } catch (e) {
                    console.log(`${table}: skipped`);
                }
            }

            const result = await pool.request().query(
                "DELETE FROM dbo.Employees"
            );

            console.log("");
            console.log(`Employees deleted: ${result.rowsAffected[0]}`);
        }

        if (type === "phone") {

            const result = await pool.request().query(
                "DELETE FROM dbo.Phones"
            );

            console.log("");
            console.log(`Phones deleted: ${result.rowsAffected[0]}`);
        }

        if (type === "switch") {

            // Ports first because SwitchPorts depends on Switches
            try {
                const ports = await pool.request().query(
                    "DELETE FROM dbo.SwitchPorts"
                );

                console.log(
                    `Switch Ports deleted: ${ports.rowsAffected[0]}`
                );
            } catch (e) {
                console.log("SwitchPorts:", e.message);
            }

            const switches = await pool.request().query(
                "DELETE FROM dbo.Switches"
            );

            console.log(
                `Switches deleted: ${switches.rowsAffected[0]}`
            );
        }

        await pool.close();

        console.log("");
        console.log("==========================================");
        console.log("       DELETE COMPLETED SUCCESSFULLY");
        console.log("==========================================");

    } catch (error) {

        console.log("");
        console.log("==========================================");
        console.log("             DELETE FAILED");
        console.log("==========================================");
        console.log("");
        console.log(error.message);
        console.log("");

        process.exit(1);
    }
}

main();
