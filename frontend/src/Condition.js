import "./CSS/Condition.css";
import "bootstrap";
import axios from "axios";
import { useState, useEffect } from "react";

export default function Condition() {
  const [formData, setFormData] = useState({
    current_tumor_size: "",
    previous_tumor_size: "",
    current_nodes_positive: "",
    previous_nodes_positive: "",
  });

  const [prediction, setPrediction] = useState("");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(
        "https://breast-cancer-treatment-prediction.onrender.com/api/predict/condition",
        formData,
        { withCredentials: true }
      );
      setPrediction(res.data.data.result);
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(
        "https://breast-cancer-treatment-prediction.onrender.com/api/predict/condition/history",
        { withCredentials: true }
      );
      setHistory(res.data.results);
    } catch (err) {
      console.error(err);
      setError("Could not fetch history");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="condition-container">
      <div className="header-section">
        <h1>Check Condition Improvement</h1>
        <p>Fill out the details below to assess progress.</p>
      </div>

      <div className="main-content">
        <div className="form-section">
          <form onSubmit={handleSubmit}>
            <div className="form-columns">
              {/* Previous Condition Column */}
              <div className="form-column">
                <h2 className="form-title">Previous Condition</h2>
                <div className="form-group">
                  <label htmlFor="previous_tumor_size">Previous Tumor Size</label>
                  <input
                    type="number"
                    id="previous_tumor_size"
                    name="previous_tumor_size"
                    value={formData.previous_tumor_size}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="previous_nodes_positive">Previous Positive Nodes</label>
                  <input
                    type="number"
                    id="previous_nodes_positive"
                    name="previous_nodes_positive"
                    value={formData.previous_nodes_positive}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Current Condition Column */}
              <div className="form-column">
                <h2 className="form-title">Current Condition</h2>
                <div className="form-group">
                  <label htmlFor="current_tumor_size">Current Tumor Size</label>
                  <input
                    type="number"
                    id="current_tumor_size"
                    name="current_tumor_size"
                    value={formData.current_tumor_size}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="current_nodes_positive">Current Positive Nodes</label>
                  <input
                    type="number"
                    id="current_nodes_positive"
                    name="current_nodes_positive"
                    value={formData.current_nodes_positive}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="submit-container">
              <button type="submit" className="submit-btn">
                Check Condition
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}
          </form>

          {prediction && (
            <div
              className={`prediction-result result-text ${prediction === "Improved"
                  ? "result-improved"
                  : prediction === "Worsened"
                    ? "result-worsened"
                    : "result-stable"
                }`}
            >
              <strong>Prediction:</strong> {prediction}
            </div>
          )}
        </div>

        <div className="history-section">
          <h2>Condition History</h2>
          {history.length === 0 ? (
            <p className="no-history">No previous checks found.</p>
          ) : (
            <div className="table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Previous Tumor Size</th>
                    <th>Current Tumor Size</th>
                    <th>Previous Nodes Positive</th>
                    <th>Current Nodes Positive</th>
                    <th>Prediction Result</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, idx) => (
                    <tr key={idx}>
                      <td>{new Date(item.checkedAt).toLocaleString()}</td>
                      <td>{item.previous_tumor_size}</td>
                      <td>{item.current_tumor_size}</td>
                      <td>{item.previous_nodes_positive}</td>
                      <td>{item.current_nodes_positive}</td>
                      <td
                        className={`result-${item.result.toLowerCase() || "stable"
                          }`}
                      >
                        {item.result}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
