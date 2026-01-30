const path = require("path");
const { spawn } = require("child_process");
const User = require("../models/User");

const getAlternativeTreatmentPlan = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || req.session.user?.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized. Please log in." });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const radiationRecode = req.body["Radiation recode"];
        const chemotherapyRecode = req.body["Chemotherapy recode"];
        const radiationSequence = req.body["Radiation sequence with surgery"];

        if (!radiationRecode || !chemotherapyRecode || !radiationSequence) {
            return res.status(400).json({ error: "Missing treatment input fields" });
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
            "Race recode": user.race,

            // ✅ Treatment fields from request
            "Radiation recode": radiationRecode,
            "Chemotherapy recode": chemotherapyRecode,
            "Radiation sequence with surgery": radiationSequence
        };

        const scriptPath = path.resolve(__dirname, "../ml/alternative_treatment_plan.py");
        const pythonProcess = spawn("python", [scriptPath, JSON.stringify(formattedData)]);

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
                return res.status(500).json({ error: "Python script failed", details: errorData });
            }

            try {
                const lines = responseData.trim().split("\n");
                const jsonLine = lines.find(line => line.startsWith("{"));
                const result = JSON.parse(jsonLine);
                res.json(result);
            } catch (err) {
                console.error("Failed to parse response:", responseData);
                res.status(500).json({ error: "Failed to parse Python response", raw: responseData });
            }
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};

module.exports = { getAlternativeTreatmentPlan };
