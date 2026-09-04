const express = require("express");
const { getPG } = require("./pg-db");

const router = express.Router();

/* =========================
   ADD EMPLOYEE
========================= */

router.post("/api/neon/employees", async (req, res) => {
    try {
        const {
            EMP_NAME,
            EMP_CODE,
            SAP_CODE,
            DOMAIN_ID,
            EMAIL,
            MOBILE_NO,
            PHONE_NO,
            DEPARTMENT,
            DESIGNATION
        } = req.body;

        if (!EMP_NAME || !EMP_CODE || !DOMAIN_ID) {
            return res.status(400).json({
                success: false,
                message: "Employee Name, Employee Code and Domain ID are required."
            });
        }

        const db = await getPG();

        const idResult = await db.query(`
            SELECT COALESCE(MAX("ID"), 0) + 1 AS next_id
            FROM "Employees"
        `);

        const nextId = Number(idResult.rows[0].next_id);

        await db.query(`
            INSERT INTO "Employees"
            (
                "ID",
                "EMP_NAME",
                "EMP_CODE",
                "SAP_CODE",
                "DOMAIN_ID",
                "EMAIL",
                "MOBILE_NO",
                "PHONE_NO",
                "DEPARTMENT",
                "DESIGNATION",
                "CREATED_AT"
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
        `, [
            nextId,
            EMP_NAME,
            EMP_CODE,
            SAP_CODE || "",
            DOMAIN_ID,
            EMAIL || "",
            MOBILE_NO || "",
            PHONE_NO || "",
            DEPARTMENT || "",
            DESIGNATION || ""
        ]);

        res.json({
            success: true,
            message: "Employee added successfully.",
            ID: nextId
        });

    } catch (error) {
        console.error("ADD EMPLOYEE ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;