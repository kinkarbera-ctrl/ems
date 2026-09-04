
require("dotenv").config();

const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const pgEmployeeApi = require("./pg-employee-api");

const app = express();
const PORT = process.env.PORT || 3000;

/* =====================================================
   POSTGRESQL / SUPABASE CONNECTION
===================================================== */

if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL is not configured.");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on("error", (err) => {
    console.error("PostgreSQL Pool Error:", err);
});

/* =====================================================
   EXPRESS CONFIGURATION
===================================================== */

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* =====================================================
   POSTGRESQL TEST
===================================================== */

app.get("/api/health", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW() AS time");

        res.json({
            success: true,
            database: "PostgreSQL",
            status: "connected",
            time: result.rows[0].time
        });
    } catch (error) {
        console.error("Database Health Error:", error);

        res.status(500).json({
            success: false,
            database: "PostgreSQL",
            status: "error",
            message: error.message
        });
    }
});

/* =====================================================
   EMPLOYEE POSTGRESQL API
===================================================== */

app.use(pgEmployeeApi);

/* =====================================================
   HOME
===================================================== */

app.get("/", (req, res) => {
    res.redirect("/dashboard");
});

/* =====================================================
   DASHBOARD
===================================================== */

app.get("/dashboard", async (req, res) => {
    try {
        const employees = await pool.query(`
            SELECT
                id,
                emp_code,
                emp_name,
                department,
                designation
            FROM employees
            ORDER BY id DESC
            LIMIT 10
        `);

        const employeeCount = await pool.query(`
            SELECT COUNT(*) AS total
            FROM employees
        `);

        const phoneCount = await pool.query(`
            SELECT COUNT(*) AS total
            FROM phones
        `);

        const switchCount = await pool.query(`
            SELECT COUNT(*) AS total
            FROM switches
        `);

        const switches = await pool.query(`
            SELECT
                id,
                switchname,
                location,
                ipaddress,
                vendor,
                model,
                status
            FROM switches
            ORDER BY id DESC
            LIMIT 10
        `);

        res.render("dashboard", {
            totalEmployees: Number(employeeCount.rows[0].total),
            totalPhones: Number(phoneCount.rows[0].total),
            totalSwitches: Number(switchCount.rows[0].total),
            employees: employees.rows,
            switches: switches.rows
        });

    } catch (error) {
        console.error("Dashboard Error:", error);

        res.status(500).send(
            "Dashboard Database Error: " + error.message
        );
    }
});

/* =====================================================
   EMPLOYEE MASTER
===================================================== */

app.get("/employees", require("./pg-employee-route"));

/* =====================================================
   PHONE MASTER
===================================================== */

app.get("/phones", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                employeecode,
                employeename,
                mobile,
                phone,
                extension,
                createdat,
                updatedat
            FROM phones
            ORDER BY id DESC
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

/* =====================================================
   SWITCH MASTER
===================================================== */

app.get("/switches", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                switchname,
                location,
                ipaddress,
                switchtype,
                switchmode,
                vendor,
                model,
                serialno,
                portcount,
                rack,
                status,
                remarks,
                createdat
            FROM switches
            ORDER BY id DESC
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

/* =====================================================
   MASTER DATA
===================================================== */

app.get("/master-data", (req, res) => {
    res.render("master-data");
});

/* =====================================================
   SERVER START
===================================================== */

app.listen(PORT, "0.0.0.0", () => {
    console.log("");
    console.log("==========================================");
    console.log("       EMS POSTGRESQL SERVER STARTED");
    console.log("==========================================");
    console.log("PORT:", PORT);
    console.log("DATABASE: PostgreSQL / Supabase");
    console.log("==========================================");
});
