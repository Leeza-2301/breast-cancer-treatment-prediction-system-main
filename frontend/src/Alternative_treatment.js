import "./CSS/Alternative_treatment.css";
import "bootstrap";
import axios from "axios";
import { useState, useEffect } from "react";

export default function Alternative_treatment() {
  const [medicalDetails, setMedicalDetails] = useState(null);
  const [formData, setFormData] = useState({
    "Radiation recode": "",
    "Chemotherapy recode": "",
    "Radiation sequence with surgery": "",
  });
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); //Added loading state

  useEffect(() => {
    const fetchMedicalDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/details`, {
          withCredentials: true,
        });
        setMedicalDetails(response.data.user || response.data);
      } catch (error) {
        console.error("Error fetching medical details:", error);
        setError("Failed to load medical details.");
      }
    };

    fetchMedicalDetails();
  }, []);

  const formatKey = (key) => key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const formatValue = (value) =>
    typeof value === "string" && ["no", "nan", "NaN"].includes(value.toLowerCase())
      ? "Not Required"
      : value;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const predictAlternative = async () => {
    setLoading(true); // 👈 Start loader
    setPrediction(null);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/treatment/predict-alternative-treatment`,
        formData,
        { withCredentials: true }
      );
      setPrediction(response.data.prediction);
      setError(null);
    } catch (err) {
      console.error("Prediction failed:", err);
      setError("Alternative treatment prediction failed.");
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const renderObject = (obj) =>
    Object.entries(obj).map(([key, val], idx) =>
      key.toLowerCase() === "status" && val.toLowerCase() === "success" ? null : (
        <p key={idx}>
          <strong>{formatKey(key)}:</strong> {formatValue(val)}
        </p>
      )
    );

  return (
    <div className="treatment-container" style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
      <div className="details-boxa" style={{ flex: 1, minWidth: "300px" }}>
        <h2 className="treatment-heading">Medical Details</h2>
        {error && <p className="error-text">{error}</p>}
        {medicalDetails ? (
          Object.entries(medicalDetails).map(([key, value], index) => (
            <div key={index} className="detail-item">
              <strong>{formatKey(key)}:</strong>{" "}
              {typeof value === "object" && value !== null
                ? renderObject(value)
                : formatValue(value)}
            </div>
          ))
        ) : (
          <p>Loading medical details...</p>
        )}
      </div>

      <div className="prediction-box" style={{ flex: 1, minWidth: "300px" }}>
        <h2 className="prediction-heading">Alternative Treatment Plan</h2>

        <div className="form-group mb-3">
          <label>Radiation Recode</label>
          <select
            className="form-control"
            name="Radiation recode"
            value={formData["Radiation recode"]}
            onChange={handleChange}
          >
            <option value="">Select Radiation</option>
            <option>Beam radiation</option>
            <option>Combination of beam with implants or isotopes</option>
            <option>Radioactive implants (includes brachytherapy)</option>
            <option>Radioisotopes</option>
            <option>Refused</option>
            <option>nan</option>
          </select>
        </div>

        <div className="form-group mb-3">
          <label>Chemotherapy Recode</label>
          <select
            className="form-control"
            name="Chemotherapy recode"
            value={formData["Chemotherapy recode"]}
            onChange={handleChange}
          >
            <option value="">Select Chemotherapy</option>
            <option>No</option>
            <option>Yes</option>
          </select>
        </div>

        <div className="form-group mb-3">
          <label>Radiation Sequence with Surgery</label>
          <select
            className="form-control"
            name="Radiation sequence with surgery"
            value={formData["Radiation sequence with surgery"]}
            onChange={handleChange}
          >
            <option value="">Select Sequence</option>
            <option>Intraoperative rad with other rad before/after surgery</option>
            <option>Intraoperative radiation</option>
            <option>No radiation and/or cancer-directed surgery</option>
            <option>Radiation after surgery</option>
            <option>Radiation before and after surgery</option>
            <option>Radiation prior to surgery</option>
            <option>Surgery both before and after radiation</option>
          </select>
        </div>

        <button className="predict-button" onClick={predictAlternative}>
          Predict Alternative Plan
        </button>

        {/* Show loader while predicting */}
        {loading && <div className="pink-loader"></div>}

        {/* Show prediction result */}
        {prediction && !loading && (
          <div className="mt-4">
            <h3>Recommended Alternative</h3>
            {Object.entries(prediction).map(([key, value], idx) => (
              <div key={idx} className="result-item">
                <strong>{formatKey(key)}:</strong> {formatValue(value)}
              </div>
            ))}
            <p>
              <i>
                It is a data-model based prediction so it is advisable to consult your doctor or a
                specialist first.
              </i>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
