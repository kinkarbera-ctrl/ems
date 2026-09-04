require("dotenv").config();

const express = require("express");
const path = require("path");
const sql = require("mssql");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let poolPromise = null;

function getDB() {
    if (!poolPromise) {
        poolPromise = sql.connect({
            server: process.env.DB_SERVER,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            options: {
                encrypt: String(process.env.DB_ENCRYPT).toLowerCase() === "true",
                trustServerCertificate:
                    String(process.env.DB_TRUST_SERVER_CERTIFICATE).toLowerCase() === "true"
            }
        });
    }
    return poolPromise;
}


/* HOME */

app.get("/", (req, res) => {
    res.redirect("/dashboard");
});


/* DASHBOARD */

app.get("/dashboard", async (req, res) => {

    try {

        const pool = await getDB();

        const employees = await pool.request().query(`
            SELECT TOP 10
                ID, EMP_CODE, EMP_NAME, DEPARTMENT, DESIGNATION
            FROM dbo.Employees
            ORDER BY ID DESC
        `);

        const employeeCount = await pool.request().query(`
            SELECT COUNT(*) AS Total
            FROM dbo.Employees
        `);

        const phoneCount = await pool.request().query(`
            SELECT COUNT(*) AS Total
            FROM dbo.Phones
        `);

        const switchCount = await pool.request().query(`
            SELECT COUNT(*) AS Total
            FROM dbo.Switches
        `);

        const switches = await pool.request().query(`
            SELECT TOP 10
                id, switchName, location, ipAddress,
                vendor, model, status
            FROM dbo.Switches
            ORDER BY id DESC
        `);

        res.render("dashboard", {
            totalEmployees: employeeCount.recordset[0].Total,
            totalPhones: phoneCount.recordset[0].Total,
            totalSwitches: switchCount.recordset[0].Total,
            employees: employees.recordset,
            switches: switches.recordset
        });

    } catch (error) {

        console.error(error);

        res.status(500).send(
            "Dashboard Database Error: " + error.message
        );
    }
});


/* EMPLOYEES */

app.get("/employees", async (req, res) => {

    try {

        const pool = await getDB();

        const result = await pool.request().query(`
            SELECT
                ID,
                EMP_CODE,
                SAP_CODE,
                EMP_NAME,
                DOMAIN_ID,
                EMAIL,
                MOBILE_NO,
                PHONE_NO,
                DEPARTMENT,
                DESIGNATION,
                CREATED_AT
            FROM dbo.Employees
            ORDER BY ID DESC
        `);

        res.render("employees", {
            employees: result.recordset
        });

    } catch (error) {

        console.error(error);

        res.status(500).send(
            "Employee Database Error: " + error.message
        );
    }
});


/* PHONES */

app.get("/phones", async (req, res) => {

    try {

        const pool = await getDB();

        const result = await pool.request().query(`
            SELECT
                Id,
                EmployeeCode,
                EmployeeName,
                Mobile,
                Phone,
                Extension,
                CreatedAt,
                UpdatedAt
            FROM dbo.Phones
            ORDER BY Id DESC
        `);

        res.render("phones", {
            phones: result.recordset
        });

    } catch (error) {

        console.error(error);

        res.status(500).send(
            "Phone Database Error: " + error.message
        );
    }
});


/* SWITCHES */

app.get("/switches", async (req, res) => {

    try {

        const pool = await getDB();

        const result = await pool.request().query(`
            SELECT
                id,
                switchName,
                location,
                ipAddress,
                switchType,
                switchMode,
                vendor,
                model,
                serialNo,
                portCount,
                rack,
                status,
                remarks,
                createdAt
            FROM dbo.Switches
            ORDER BY id DESC
        `);

        res.render("switches", {
            switches: result.recordset
        });

    } catch (error) {

        console.error(error);

        res.status(500).send(
            "Switch Database Error: " + error.message
        );
    }
});


/* MASTER DATA */





/* MASTER DATA */
app.get("/master-data", (req, res) => {
    res.render("master-data");
});



require("./master-routes")(app, getDB, sql);

/* START SERVER */
app.listen(PORT, "0.0.0.0", () => {
    console.log("");
    console.log("======================================");
    console.log("       EMS NEW SERVER STARTED");
    console.log("======================================");
    console.log("Local : http://localhost:" + PORT);
    console.log("LAN   : http://SERVER-IP:" + PORT);
    console.log("======================================");
});




