const multer = require("multer");
const XLSX = require("xlsx");

const upload = multer({ storage: multer.memoryStorage() });

module.exports = function(app, getDB, sql) {

    /* =========================================================
       MASTER DATA PAGE
    ========================================================= */
    app.get("/master-data", (req, res) => {
        res.render("master-data");
    });


    /* =========================================================
       GET DATA
    ========================================================= */

    app.get("/api/master-data/:type", async (req, res) => {

        try {

            const pool = await getDB();
            const type = String(req.params.type).toLowerCase();

            let result;

            if (type === "department") {

                result = await pool.request().query(`
                    SELECT
                        DepartmentId,
                        DepartmentName,
                        IsActive AS active,
                        CreatedAt AS createdAt
                    FROM dbo.MasterDepartments
                    ORDER BY DepartmentId DESC
                `);

            } else if (type === "designation") {

                result = await pool.request().query(`
                    SELECT
                        DesignationId,
                        DesignationName,
                        IsActive AS active,
                        CreatedAt AS createdAt
                    FROM dbo.MasterDesignations
                    ORDER BY DesignationId DESC
                `);

            } else if (type === "location") {

                result = await pool.request().query(`
                    SELECT
                        LocationId,
                        LocationName,
                        Address AS address,
                        IsActive AS active,
                        CreatedAt AS createdAt
                    FROM dbo.MasterLocations
                    ORDER BY LocationId DESC
                `);

            } else if (type === "employee") {

                result = await pool.request().query(`
                    SELECT
                        ID,
                        EMP_CODE,
                        EMP_NAME,
                        DOMAIN_ID,
                        EMAIL,
                        MOBILE_NO,
                        PHONE_NO,
                        DEPARTMENT,
                        DESIGNATION,
                        SAP_CODE,
                        CREATED_AT
                    FROM dbo.Employees
                    ORDER BY ID DESC
                `);

            } else if (type === "phone") {

                result = await pool.request().query(`
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

            } else if (type === "switch") {

                result = await pool.request().query(`
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

            } else {

                return res.status(400).json({
                    success:false,
                    message:"Invalid master type"
                });

            }

            res.json({
                success:true,
                data:result.recordset
            });

        } catch(error) {

            console.error(error);

            res.status(500).json({
                success:false,
                message:error.message
            });

        }

    });


    /* =========================================================
       ADD
    ========================================================= */

    app.post("/api/master-data/:type", async (req,res) => {

        try {

            const pool = await getDB();
            const type = String(req.params.type).toLowerCase();
            const data = req.body;

            const request = pool.request();

            if(type === "department") {

                await request
                    .input("name", sql.NVarChar, data.name)
                    .query(`
                        INSERT INTO dbo.MasterDepartments
                        (DepartmentName, IsActive, CreatedAt)
                        VALUES
                        (@name, 1, GETDATE())
                    `);

            } else if(type === "designation") {

                await request
                    .input("name", sql.NVarChar, data.name)
                    .query(`
                        INSERT INTO dbo.MasterDesignations
                        (DesignationName, IsActive, CreatedAt)
                        VALUES
                        (@name, 1, GETDATE())
                    `);

            } else if(type === "location") {

                await request
                    .input("name", sql.NVarChar, data.name)
                    .input("address", sql.NVarChar, data.address || "")
                    .query(`
                        INSERT INTO dbo.MasterLocations
                        (LocationName, Address, IsActive, CreatedAt)
                        VALUES
                        (@name, @address, 1, GETDATE())
                    `);

            } else if(type === "employee") {

                await request
                    .input("empCode", sql.NVarChar, data.EMP_CODE || "")
                    .input("empName", sql.NVarChar, data.EMP_NAME || "")
                    .input("domainId", sql.NVarChar, data.DOMAIN_ID || "")
                    .input("email", sql.NVarChar, data.EMAIL || "")
                    .input("mobile", sql.NVarChar, data.MOBILE_NO || "")
                    .input("phone", sql.NVarChar, data.PHONE_NO || "")
                    .input("department", sql.NVarChar, data.DEPARTMENT || "")
                    .input("designation", sql.NVarChar, data.DESIGNATION || "")
                    .input("sapCode", sql.NVarChar, data.SAP_CODE || "")
                    .query(`
                        INSERT INTO dbo.Employees
                        (
                            EMP_CODE,
                            EMP_NAME,
                            DOMAIN_ID,
                            EMAIL,
                            MOBILE_NO,
                            PHONE_NO,
                            DEPARTMENT,
                            DESIGNATION,
                            SAP_CODE,
                            CREATED_AT
                        )
                        VALUES
                        (
                            @empCode,
                            @empName,
                            @domainId,
                            @email,
                            @mobile,
                            @phone,
                            @department,
                            @designation,
                            @sapCode,
                            GETDATE()
                        )
                    `);

            } else if(type === "phone") {

                await request
                    .input("employeeCode", sql.NVarChar, data.EmployeeCode || "")
                    .input("employeeName", sql.NVarChar, data.EmployeeName || "")
                    .input("mobile", sql.NVarChar, data.Mobile || "")
                    .input("phone", sql.NVarChar, data.Phone || "")
                    .input("extension", sql.NVarChar, data.Extension || "")
                    .query(`
                        INSERT INTO dbo.Phones
                        (
                            EmployeeCode,
                            EmployeeName,
                            Mobile,
                            Phone,
                            Extension,
                            CreatedAt,
                            UpdatedAt
                        )
                        VALUES
                        (
                            @employeeCode,
                            @employeeName,
                            @mobile,
                            @phone,
                            @extension,
                            GETDATE(),
                            GETDATE()
                        )
                    `);

            } else if(type === "switch") {

                await request
                    .input("switchName", sql.NVarChar, data.switchName || "")
                    .input("location", sql.NVarChar, data.location || "")
                    .input("ipAddress", sql.NVarChar, data.ipAddress || "")
                    .input("switchType", sql.NVarChar, data.switchType || "")
                    .input("switchMode", sql.NVarChar, data.switchMode || "")
                    .input("vendor", sql.NVarChar, data.vendor || "")
                    .input("model", sql.NVarChar, data.model || "")
                    .input("serialNo", sql.NVarChar, data.serialNo || "")
                    .input("portCount", sql.Int, Number(data.portCount) || 0)
                    .input("rack", sql.NVarChar, data.rack || "")
                    .input("status", sql.NVarChar, data.status || "Active")
                    .input("remarks", sql.NVarChar, data.remarks || "")
                    .query(`
                        INSERT INTO dbo.Switches
                        (
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
                        )
                        VALUES
                        (
                            @switchName,
                            @location,
                            @ipAddress,
                            @switchType,
                            @switchMode,
                            @vendor,
                            @model,
                            @serialNo,
                            @portCount,
                            @rack,
                            @status,
                            @remarks,
                            GETDATE()
                        )
                    `);

            } else {

                return res.status(400).json({
                    success:false,
                    message:"Invalid type"
                });

            }

            res.json({
                success:true,
                message:"Record added successfully"
            });

        } catch(error) {

            console.error(error);

            res.status(500).json({
                success:false,
                message:error.message
            });

        }

    });


    /* =========================================================
       EDIT
    ========================================================= */

    app.put("/api/master-data/:type/:id", async (req,res) => {

        try {

            const pool = await getDB();
            const type = String(req.params.type).toLowerCase();
            const id = Number(req.params.id);
            const data = req.body;

            const request = pool.request()
                .input("id", sql.Int, id);

            if(type === "department") {

                await request
                    .input("name", sql.NVarChar, data.name)
                    .query(`
                        UPDATE dbo.MasterDepartments
                        SET DepartmentName=@name
                        WHERE DepartmentId=@id
                    `);

            } else if(type === "designation") {

                await request
                    .input("name", sql.NVarChar, data.name)
                    .query(`
                        UPDATE dbo.MasterDesignations
                        SET DesignationName=@name
                        WHERE DesignationId=@id
                    `);

            } else if(type === "location") {

                await request
                    .input("name", sql.NVarChar, data.name)
                    .input("address", sql.NVarChar, data.address || "")
                    .query(`
                        UPDATE dbo.MasterLocations
                        SET
                            LocationName=@name,
                            Address=@address
                        WHERE LocationId=@id
                    `);

            } else if(type === "employee") {

                await request
                    .input("empCode", sql.NVarChar, data.EMP_CODE || "")
                    .input("empName", sql.NVarChar, data.EMP_NAME || "")
                    .input("domainId", sql.NVarChar, data.DOMAIN_ID || "")
                    .input("email", sql.NVarChar, data.EMAIL || "")
                    .input("mobile", sql.NVarChar, data.MOBILE_NO || "")
                    .input("phone", sql.NVarChar, data.PHONE_NO || "")
                    .input("department", sql.NVarChar, data.DEPARTMENT || "")
                    .input("designation", sql.NVarChar, data.DESIGNATION || "")
                    .input("sapCode", sql.NVarChar, data.SAP_CODE || "")
                    .query(`
                        UPDATE dbo.Employees
                        SET
                            EMP_CODE=@empCode,
                            EMP_NAME=@empName,
                            DOMAIN_ID=@domainId,
                            EMAIL=@email,
                            MOBILE_NO=@mobile,
                            PHONE_NO=@phone,
                            DEPARTMENT=@department,
                            DESIGNATION=@designation,
                            SAP_CODE=@sapCode
                        WHERE ID=@id
                    `);

            } else if(type === "phone") {

                await request
                    .input("employeeCode", sql.NVarChar, data.EmployeeCode || "")
                    .input("employeeName", sql.NVarChar, data.EmployeeName || "")
                    .input("mobile", sql.NVarChar, data.Mobile || "")
                    .input("phone", sql.NVarChar, data.Phone || "")
                    .input("extension", sql.NVarChar, data.Extension || "")
                    .query(`
                        UPDATE dbo.Phones
                        SET
                            EmployeeCode=@employeeCode,
                            EmployeeName=@employeeName,
                            Mobile=@mobile,
                            Phone=@phone,
                            Extension=@extension,
                            UpdatedAt=GETDATE()
                        WHERE Id=@id
                    `);

            } else if(type === "switch") {

                await request
                    .input("switchName", sql.NVarChar, data.switchName || "")
                    .input("location", sql.NVarChar, data.location || "")
                    .input("ipAddress", sql.NVarChar, data.ipAddress || "")
                    .input("switchType", sql.NVarChar, data.switchType || "")
                    .input("switchMode", sql.NVarChar, data.switchMode || "")
                    .input("vendor", sql.NVarChar, data.vendor || "")
                    .input("model", sql.NVarChar, data.model || "")
                    .input("serialNo", sql.NVarChar, data.serialNo || "")
                    .input("portCount", sql.Int, Number(data.portCount) || 0)
                    .input("rack", sql.NVarChar, data.rack || "")
                    .input("status", sql.NVarChar, data.status || "Active")
                    .input("remarks", sql.NVarChar, data.remarks || "")
                    .query(`
                        UPDATE dbo.Switches
                        SET
                            switchName=@switchName,
                            location=@location,
                            ipAddress=@ipAddress,
                            switchType=@switchType,
                            switchMode=@switchMode,
                            vendor=@vendor,
                            model=@model,
                            serialNo=@serialNo,
                            portCount=@portCount,
                            rack=@rack,
                            status=@status,
                            remarks=@remarks
                        WHERE id=@id
                    `);

            } else {

                return res.status(400).json({
                    success:false,
                    message:"Invalid type"
                });

            }

            res.json({
                success:true,
                message:"Record updated successfully"
            });

        } catch(error) {

            console.error(error);

            res.status(500).json({
                success:false,
                message:error.message
            });

        }

    });


    /* =========================================================
       DELETE
    ========================================================= */

    app.delete("/api/master-data/:type/:id", async (req,res) => {

        try {

            const pool = await getDB();

            const type = String(req.params.type).toLowerCase();
            const id = Number(req.params.id);

            const request = pool.request()
                .input("id", sql.Int, id);

            if(type === "department") {

                await request.query(`
                    DELETE FROM dbo.MasterDepartments
                    WHERE DepartmentId=@id
                `);

            } else if(type === "designation") {

                await request.query(`
                    DELETE FROM dbo.MasterDesignations
                    WHERE DesignationId=@id
                `);

            } else if(type === "location") {

                await request.query(`
                    DELETE FROM dbo.MasterLocations
                    WHERE LocationId=@id
                `);

            } else if(type === "employee") {

                await request.query(`
                    DELETE FROM dbo.Employees
                    WHERE ID=@id
                `);

            } else if(type === "phone") {

                await request.query(`
                    DELETE FROM dbo.Phones
                    WHERE Id=@id
                `);

            } else if(type === "switch") {

                await request.query(`
                    DELETE FROM dbo.Switches
                    WHERE id=@id
                `);

            } else {

                return res.status(400).json({
                    success:false,
                    message:"Invalid type"
                });

            }

            res.json({
                success:true,
                message:"Record deleted successfully"
            });

        } catch(error) {

            console.error(error);

            res.status(500).json({
                success:false,
                message:error.message
            });

        }

    });


    /* =========================================================
       EXCEL TEMPLATE
    ========================================================= */

    app.get("/api/master-data/:type/template", (req,res) => {

        try {

            const type = String(req.params.type).toLowerCase();

            let headers = [];
            let fileName = "Master_Template.xlsx";

            if(type === "department") {

                headers = [
                    "DepartmentName"
                ];

                fileName = "Department_Template.xlsx";

            } else if(type === "designation") {

                headers = [
                    "DesignationName"
                ];

                fileName = "Designation_Template.xlsx";

            } else if(type === "location") {

                headers = [
                    "LocationName",
                    "Address"
                ];

                fileName = "Location_Template.xlsx";

            } else if(type === "employee") {

                headers = [
                    "EMP_CODE",
                    "EMP_NAME",
                    "DOMAIN_ID",
                    "EMAIL",
                    "MOBILE_NO",
                    "PHONE_NO",
                    "DEPARTMENT",
                    "DESIGNATION",
                    "SAP_CODE"
                ];

                fileName = "Employee_Template.xlsx";

            } else if(type === "phone") {

                headers = [
                    "EmployeeCode",
                    "EmployeeName",
                    "Mobile",
                    "Phone",
                    "Extension"
                ];

                fileName = "Phone_Template.xlsx";

            } else if(type === "switch") {

                headers = [
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
                    "remarks"
                ];

                fileName = "Switch_Template.xlsx";

            } else {

                return res.status(400).send("Invalid master type");

            }

            const worksheet = XLSX.utils.json_to_sheet([], {
                header: headers
            });

            XLSX.utils.sheet_add_aoa(
                worksheet,
                [headers],
                { origin:"A1" }
            );

            worksheet["!cols"] =
                headers.map(() => ({ wch:22 }));

            const workbook = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Template"
            );

            const buffer = XLSX.write(
                workbook,
                {
                    type:"buffer",
                    bookType:"xlsx"
                }
            );

            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${fileName}"`
            );

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );

            res.send(buffer);

        } catch(error) {

            console.error(error);

            res.status(500).send(error.message);

        }

    });


    /* =========================================================
       EXCEL EXPORT
    ========================================================= */

    app.get("/api/master-data/:type/export", async (req,res) => {

        try {

            const pool = await getDB();
            const type = String(req.params.type).toLowerCase();

            let result;
            let fileName;

            if(type === "department") {

                result = await pool.request().query(`
                    SELECT
                        DepartmentName,
                        IsActive
                    FROM dbo.MasterDepartments
                    ORDER BY DepartmentId
                `);

                fileName = "Department_Export.xlsx";

            } else if(type === "designation") {

                result = await pool.request().query(`
                    SELECT
                        DesignationName,
                        IsActive
                    FROM dbo.MasterDesignations
                    ORDER BY DesignationId
                `);

                fileName = "Designation_Export.xlsx";

            } else if(type === "location") {

                result = await pool.request().query(`
                    SELECT
                        LocationName,
                        Address,
                        IsActive
                    FROM dbo.MasterLocations
                    ORDER BY LocationId
                `);

                fileName = "Location_Export.xlsx";

            } else if(type === "employee") {

                result = await pool.request().query(`
                    SELECT
                        EMP_CODE,
                        EMP_NAME,
                        DOMAIN_ID,
                        EMAIL,
                        MOBILE_NO,
                        PHONE_NO,
                        DEPARTMENT,
                        DESIGNATION,
                        SAP_CODE,
                        CREATED_AT
                    FROM dbo.Employees
                    ORDER BY ID
                `);

                fileName = "Employee_Export.xlsx";

            } else if(type === "phone") {

                result = await pool.request().query(`
                    SELECT
                        EmployeeCode,
                        EmployeeName,
                        Mobile,
                        Phone,
                        Extension,
                        CreatedAt,
                        UpdatedAt
                    FROM dbo.Phones
                    ORDER BY Id
                `);

                fileName = "Phone_Export.xlsx";

            } else if(type === "switch") {

                result = await pool.request().query(`
                    SELECT
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
                    ORDER BY id
                `);

                fileName = "Switch_Export.xlsx";

            } else {

                return res.status(400).send("Invalid master type");

            }

            const worksheet =
                XLSX.utils.json_to_sheet(result.recordset);

            const workbook =
                XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Data"
            );

            const buffer = XLSX.write(
                workbook,
                {
                    type:"buffer",
                    bookType:"xlsx"
                }
            );

            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${fileName}"`
            );

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );

            res.send(buffer);

        } catch(error) {

            console.error(error);

            res.status(500).send(error.message);

        }

    });


    /* =========================================================
       EXCEL IMPORT
    ========================================================= */

    app.post(
        "/api/master-data/:type/import",
        upload.single("file"),
        async(req,res) => {

            try {

                if(!req.file) {

                    return res.status(400).json({
                        success:false,
                        message:"Excel file required"
                    });

                }

                const pool = await getDB();
                const type = String(req.params.type).toLowerCase();

                const workbook =
                    XLSX.read(
                        req.file.buffer,
                        { type:"buffer" }
                    );

                const sheet =
                    workbook.Sheets[
                        workbook.SheetNames[0]
                    ];

                const rows =
                    XLSX.utils.sheet_to_json(sheet, {
                        defval:""
                    });

                let imported = 0;

                for(const row of rows) {

                    if(type === "department") {

                        if(!row.DepartmentName) continue;

                        await pool.request()
                            .input(
                                "name",
                                sql.NVarChar,
                                String(row.DepartmentName)
                            )
                            .query(`
                                INSERT INTO dbo.MasterDepartments
                                (
                                    DepartmentName,
                                    IsActive,
                                    CreatedAt
                                )
                                VALUES
                                (
                                    @name,
                                    1,
                                    GETDATE()
                                )
                            `);

                    } else if(type === "designation") {

                        if(!row.DesignationName) continue;

                        await pool.request()
                            .input(
                                "name",
                                sql.NVarChar,
                                String(row.DesignationName)
                            )
                            .query(`
                                INSERT INTO dbo.MasterDesignations
                                (
                                    DesignationName,
                                    IsActive,
                                    CreatedAt
                                )
                                VALUES
                                (
                                    @name,
                                    1,
                                    GETDATE()
                                )
                            `);

                    } else if(type === "location") {

                        if(!row.LocationName) continue;

                        await pool.request()
                            .input(
                                "name",
                                sql.NVarChar,
                                String(row.LocationName)
                            )
                            .input(
                                "address",
                                sql.NVarChar,
                                String(row.Address || "")
                            )
                            .query(`
                                INSERT INTO dbo.MasterLocations
                                (
                                    LocationName,
                                    Address,
                                    IsActive,
                                    CreatedAt
                                )
                                VALUES
                                (
                                    @name,
                                    @address,
                                    1,
                                    GETDATE()
                                )
                            `);

                    } else if(type === "employee") {

                        if(!row.EMP_NAME && !row.EMP_CODE) continue;

                        await pool.request()
                            .input("empCode",sql.NVarChar,String(row.EMP_CODE || ""))
                            .input("empName",sql.NVarChar,String(row.EMP_NAME || ""))
                            .input("domainId",sql.NVarChar,String(row.DOMAIN_ID || ""))
                            .input("email",sql.NVarChar,String(row.EMAIL || ""))
                            .input("mobile",sql.NVarChar,String(row.MOBILE_NO || ""))
                            .input("phone",sql.NVarChar,String(row.PHONE_NO || ""))
                            .input("department",sql.NVarChar,String(row.DEPARTMENT || ""))
                            .input("designation",sql.NVarChar,String(row.DESIGNATION || ""))
                            .input("sapCode",sql.NVarChar,String(row.SAP_CODE || ""))
                            .query(`
                                INSERT INTO dbo.Employees
                                (
                                    EMP_CODE,
                                    EMP_NAME,
                                    DOMAIN_ID,
                                    EMAIL,
                                    MOBILE_NO,
                                    PHONE_NO,
                                    DEPARTMENT,
                                    DESIGNATION,
                                    SAP_CODE,
                                    CREATED_AT
                                )
                                VALUES
                                (
                                    @empCode,
                                    @empName,
                                    @domainId,
                                    @email,
                                    @mobile,
                                    @phone,
                                    @department,
                                    @designation,
                                    @sapCode,
                                    GETDATE()
                                )
                            `);

                    } else if(type === "phone") {

                        if(!row.EmployeeCode && !row.EmployeeName) continue;

                        await pool.request()
                            .input("employeeCode",sql.NVarChar,String(row.EmployeeCode || ""))
                            .input("employeeName",sql.NVarChar,String(row.EmployeeName || ""))
                            .input("mobile",sql.NVarChar,String(row.Mobile || ""))
                            .input("phone",sql.NVarChar,String(row.Phone || ""))
                            .input("extension",sql.NVarChar,String(row.Extension || ""))
                            .query(`
                                INSERT INTO dbo.Phones
                                (
                                    EmployeeCode,
                                    EmployeeName,
                                    Mobile,
                                    Phone,
                                    Extension,
                                    CreatedAt,
                                    UpdatedAt
                                )
                                VALUES
                                (
                                    @employeeCode,
                                    @employeeName,
                                    @mobile,
                                    @phone,
                                    @extension,
                                    GETDATE(),
                                    GETDATE()
                                )
                            `);

                    } else if(type === "switch") {

                        if(!row.switchName) continue;

                        await pool.request()
                            .input("switchName",sql.NVarChar,String(row.switchName || ""))
                            .input("location",sql.NVarChar,String(row.location || ""))
                            .input("ipAddress",sql.NVarChar,String(row.ipAddress || ""))
                            .input("switchType",sql.NVarChar,String(row.switchType || ""))
                            .input("switchMode",sql.NVarChar,String(row.switchMode || ""))
                            .input("vendor",sql.NVarChar,String(row.vendor || ""))
                            .input("model",sql.NVarChar,String(row.model || ""))
                            .input("serialNo",sql.NVarChar,String(row.serialNo || ""))
                            .input("portCount",sql.Int,Number(row.portCount) || 0)
                            .input("rack",sql.NVarChar,String(row.rack || ""))
                            .input("status",sql.NVarChar,String(row.status || "Active"))
                            .input("remarks",sql.NVarChar,String(row.remarks || ""))
                            .query(`
                                INSERT INTO dbo.Switches
                                (
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
                                )
                                VALUES
                                (
                                    @switchName,
                                    @location,
                                    @ipAddress,
                                    @switchType,
                                    @switchMode,
                                    @vendor,
                                    @model,
                                    @serialNo,
                                    @portCount,
                                    @rack,
                                    @status,
                                    @remarks,
                                    GETDATE()
                                )
                            `);

                    } else {

                        return res.status(400).json({
                            success:false,
                            message:"Invalid master type"
                        });

                    }

                    imported++;

                }

                res.json({
                    success:true,
                    imported:imported,
                    message:imported + " records imported successfully"
                });

            } catch(error) {

                console.error(error);

                res.status(500).json({
                    success:false,
                    message:error.message
                });

            }

        }
    );

};

