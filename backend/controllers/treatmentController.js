// treatmentController.js
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const User = require("../models/User");

const getTreatmentPlan = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || req.session.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const formattedData = {
            "Age at diagnosis": user.age,
            "Regional nodes positive (1988+)": user.regional_nodes_positive,
            "Total number of in situ/malignant tumors for patient": user.total_tumors,
            "ER Status Recode Breast Cancer (1990+)": user.er_status,
            "PR Status Recode Breast Cancer (1990+)": user.pr_status,
            "CS tumor size (2004-2015)": user.tumor_size,
            "Derived HER2 Recode (2010+)": user.her2_status,
            "Regional nodes examined (1988+)": user.regional_nodes_examined,
            "Race recode": user.race
        };

        const scriptPath = path.resolve(__dirname, "../ml/treatment_plan.py");

        console.log("Resolved path:", scriptPath);
        console.log("Exists?", fs.existsSync(scriptPath)); // Debug check

        const escapedData = JSON.stringify(formattedData).replace(/"/g, '\\"');

        const pythonProcess = spawn("python", [`"${scriptPath}"`, `"${escapedData}"`], {
            shell: true
        });

        let responseData = "";
        let errorData = "";

        pythonProcess.stdout.on("data", (data) => {
            responseData += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
            errorData += data.toString();
        });

        pythonProcess.on("close", (code) => {
            if (code !== 0) {
                console.error("Python script failed:", errorData);
                return res.status(500).json({ error: "Python script failed", details: errorData });
            }

            try {
                // Extract only the valid JSON line (start with { and no "RAW INPUT:")
                const jsonLine = responseData
                    .split("\n")
                    .map(line => line.trim())
                    .find(line => line.startsWith("{"));

                const result = JSON.parse(jsonLine);
                return res.json(result);
            } catch (err) {
                console.error("Failed to parse response:", responseData);
                return res.status(500).json({ error: "Failed to parse Python response", raw: responseData });
            }
        });

    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Internal server error", message: err.message });
    }
};

module.exports = { getTreatmentPlan };
