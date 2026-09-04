require("dotenv").config();

const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();

const PORT = process.env.PORT || 3000;

// =====================================================
// POSTGRESQL CONNECTION
// =====================================================

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on("connect", () => {
    console.log("PostgreSQL connected.");
});

pool.on("error", (err) => {
    console.error("PostgreSQL Pool Error:", err);
});

// =====================================================
// EXPRESS CONFIGURATION
// =====================================================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                current_database() AS database,
                current_user AS user
        `);

        res.json({
            success: true,
            database: "PostgreSQL",
            status: "connected",
            database_name: result.rows[0].database,
            user: result.rows[0].user,
            time: new Date().toISOString()
        });

    } catch (error) {

        console.error("Health Error:", error);

        res.status(500).json({
            success: false,
            database: "PostgreSQL",
            status: "error",
            error: error.message
        });
    }
});

// =====================================================
// ROOT
// =====================================================

app.get("/", (req, res) => {
    res.redirect("/dashboard");
});

// =====================================================
// DASHBOARD
// =====================================================

app.get("/dashboard", async (req, res) => {

    try {

        // ---------------------------------------------
        // EMPLOYEES
        // ---------------------------------------------

        const employees = await pool.query(`
            SELECT
                "ID",
                "EMP_CODE",
                "EMP_NAME",
                "DEPARTMENT",
                "DESIGNATION"
            FROM "Employees"
            ORDER BY "ID" DESC
            LIMIT 10
        `);

        // ---------------------------------------------
        // EMPLOYEE COUNT
        // ---------------------------------------------

        const employeeCount = await pool.query(`
            SELECT COUNT(*) AS total
            FROM "Employees"
        `);

        // ---------------------------------------------
        // PHONE COUNT
        // ---------------------------------------------

        const phoneCount = await pool.query(`
            SELECT COUNT(*) AS total
            FROM "Phones"
        `);

        // ---------------------------------------------
        // SWITCH COUNT
        // ---------------------------------------------

        const switchCount = await pool.query(`
            SELECT COUNT(*) AS total
            FROM "Switches"
        `);

        // ---------------------------------------------
        // SWITCHES
        // ---------------------------------------------

        const switches = await pool.query(`
            SELECT
                "id",
                "switchName",
                "location",
                "ipAddress",
                "vendor",
                "model",
                "status"
            FROM "Switches"
            ORDER BY "id" DESC
            LIMIT 10
        `);

        // ---------------------------------------------
        // RENDER
        // ---------------------------------------------

        res.render("dashboard", {

            totalEmployees:
                Number(employeeCount.rows[0].total),

            totalPhones:
                Number(phoneCount.rows[0].total),

            totalSwitches:
                Number(switchCount.rows[0].total),

            employees:
                employees.rows,

            switches:
                switches.rows
        });

    } catch (error) {

        console.error("Dashboard Error:", error);

        res.status(500).send(
            "Dashboard Database Error: " + error.message
        );
    }
});

// =====================================================
// EMPLOYEES
// =====================================================

app.get("/employees", async (req, res) => {

    try {

        const result = await pool.query(`
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

        console.error("Employees Error:", error);

        res.status(500).send(
            "Employees Database Error: " + error.message
        );
    }
});

// =====================================================
// PHONES
// =====================================================

app.get("/phones", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                "id",
                "EmployeeCode",
                "EmployeeName",
                "Mobile",
                "Phone",
                "Extension",
                "CreatedAt",
                "UpdatedAt"
            FROM "Phones"
            ORDER BY "id" DESC
        `);

        res.render("phones", {
            phones: result.rows
        });

    } catch (error) {

        console.error("Phone Error:", error);

        res.status(500).send(
            "Phone Database Error: " + error.message
        );
    }
});

// =====================================================
// SWITCHES
// =====================================================

app.get("/switches", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                "id",
                "switchName",
                "location",
                "ipAddress",
                "switchType",
                "switchMode",
                "vendor",
                "model",
                "serialNo",
                "portCount",
                "rack",
                "status",
                "remarks",
                "createdAt"
            FROM "Switches"
            ORDER BY "id" DESC
        `);

        res.render("switches", {
            switches: result.rows
        });

    } catch (error) {

        console.error("Switch Error:", error);

        res.status(500).send(
            "Switch Database Error: " + error.message
        );
    }
});

// =====================================================
// DATABASE TEST
// =====================================================

app.get("/api/db-test", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                current_database() AS database,
                current_user AS user
        `);

        const tables = await pool.query(`
            SELECT
                table_schema,
                table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        res.json({
            success: true,
            database: result.rows[0],
            tables: tables.rows
        });

    } catch (error) {

        console.error("DB Test Error:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =====================================================
// 404
// =====================================================

app.use((req, res) => {

    res.status(404).send(
        "Page not found: " + req.originalUrl
    );
});

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, "0.0.0.0", () => {

    console.log("");
    console.log("==========================================");
    console.log("       EMS POSTGRESQL SERVER STARTED");
    console.log("==========================================");
    console.log("PORT:", PORT);
    console.log("DATABASE: PostgreSQL");
    console.log("==========================================");
});
