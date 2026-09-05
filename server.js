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

        const employeeCount = await pool.query(`
            SELECT COUNT(*) AS total
            FROM "Employees"
        `);

        const phoneCount = await pool.query(`
            SELECT COUNT(*) AS total
            FROM "Phones"
        `);

        const switchCount = await pool.query(`
            SELECT COUNT(*) AS total
            FROM "Switches"
        `);

        const switches = await pool.query(`
            SELECT
                id,
                "switchName",
                location,
                "ipAddress",
                vendor,
                model,
                status
            FROM "Switches"
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
                id,
                "EmployeeCode",
                "EmployeeName",
                "Mobile",
                "Phone",
                "Extension",
                "CreatedAt",
                "UpdatedAt"
            FROM "Phones"
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

// =====================================================
// SWITCHES
// =====================================================

app.get("/switches", async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                id,
                "switchName",
                location,
                "ipAddress",
                "switchType",
                "switchMode",
                vendor,
                model,
                "serialNo",
                "portCount",
                rack,
                status,
                remarks,
                "createdAt"
            FROM "Switches"
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

// =====================================================
// MASTER DATA PAGE
// =====================================================

app.get("/master-data", async (req, res) => {
    try {

        const masterData = await pool.query(`
            SELECT
                "MasterId",
                "MasterType",
                "MasterCode",
                "MasterName",
                "Description",
                "IsActive",
                "CreatedAt",
                "UpdatedAt"
            FROM "MasterData"
            ORDER BY "MasterId" DESC
        `);

        res.render("master-data", {
            masterData: masterData.rows
        });

    } catch (error) {
        console.error("Master Data Page Error:", error);

        res.status(500).send(
            "Master Data Database Error: " + error.message
        );
    }
});

// =====================================================
// MASTER DATA API
// =====================================================

app.get("/api/master-data/:type", async (req, res) => {

    try {

        const type = String(req.params.type).toLowerCase();

        let result;

        if (type === "department") {

            result = await pool.query(`
                SELECT
                    "MasterId",
                    "MasterType",
                    "MasterCode",
                    "MasterName",
                    "Description",
                    "IsActive",
                    "CreatedAt",
                    "UpdatedAt"
                FROM "MasterData"
                WHERE LOWER("MasterType") = 'department'
                ORDER BY "MasterId" DESC
            `);

        } else if (type === "designation") {

            result = await pool.query(`
                SELECT
                    "MasterId",
                    "MasterType",
                    "MasterCode",
                    "MasterName",
                    "Description",
                    "IsActive",
                    "CreatedAt",
                    "UpdatedAt"
                FROM "MasterData"
                WHERE LOWER("MasterType") = 'designation'
                ORDER BY "MasterId" DESC
            `);

        } else if (type === "location") {

            result = await pool.query(`
                SELECT
                    "MasterId",
                    "MasterType",
                    "MasterCode",
                    "MasterName",
                    "Description",
                    "IsActive",
                    "CreatedAt",
                    "UpdatedAt"
                FROM "MasterData"
                WHERE LOWER("MasterType") = 'location'
                ORDER BY "MasterId" DESC
            `);

        } else if (type === "employee") {

            result = await pool.query(`
                SELECT
                    "ID",
                    "EMP_CODE",
                    "EMP_NAME",
                    "DOMAIN_ID",
                    "EMAIL",
                    "MOBILE_NO",
                    "PHONE_NO",
                    "DEPARTMENT",
                    "DESIGNATION",
                    "SAP_CODE",
                    "CREATED_AT"
                FROM "Employees"
                ORDER BY "ID" DESC
            `);

        } else if (type === "phone") {

            result = await pool.query(`
                SELECT
                    id,
                    "EmployeeCode",
                    "EmployeeName",
                    "Mobile",
                    "Phone",
                    "Extension",
                    "CreatedAt",
                    "UpdatedAt"
                FROM "Phones"
                ORDER BY id DESC
            `);

        } else if (type === "switch") {

            result = await pool.query(`
                SELECT
                    id,
                    "switchName",
                    location,
                    "ipAddress",
                    "switchType",
                    "switchMode",
                    vendor,
                    model,
                    "serialNo",
                    "portCount",
                    rack,
                    status,
                    remarks,
                    "createdAt"
                FROM "Switches"
                ORDER BY id DESC
            `);

        } else {

            return res.status(400).json({
                success: false,
                message: "Invalid master type"
            });
        }

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error("Master Data API Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// =====================================================
// 404
// =====================================================

app.use((req, res) => {
    res.status(404).send(
        "Page not found: " + req.path
    );
});

// =====================================================
// SERVER START
// =====================================================

app.listen(PORT, () => {
    console.log("======================================");
    console.log("EMS SERVER STARTED");
    console.log("Port:", PORT);
    console.log("Database: PostgreSQL");
    console.log("======================================");
});

// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================

process.on("SIGINT", async () => {
    console.log("Shutting down...");

    await pool.end();

    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("Shutting down...");

    await pool.end();

    process.exit(0);
});
