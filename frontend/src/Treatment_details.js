import "./CSS/Treatment_details.css"
import "bootstrap"
import { useState } from "react";
import { useEffect } from "react";
import axios from 'axios';
import { toast } from "react-toastify";

export default function Treatment_details() {
    const [medicalData, setMedicalData] = useState({
        age: "",
        regional_nodes_positive: "",
        total_tumors: "",
        er_status: "",
        pr_status: "",
        tumor_size: "",
        her2_status: "",
        regional_nodes_examined: "",
        race: "",
      });
    
      const [isFormSubmitted, setIsFormSubmitted] = useState(false);
      const [loading, setLoading] = useState(true);
    
      useEffect(() => {
        fetchUserDetails();
      }, []);
    
      const fetchUserDetails = async () => {
        try {
          const res = await axios.get("https://breast-cancer-treatment-prediction.onrender.com/api/user/details", {
            withCredentials: true,
          });
    
          if (res.data.user && Object.keys(res.data.user).length > 0) {
            setMedicalData(res.data.user);
            setIsFormSubmitted(true);
          }
        } catch (error) {
          console.error("Failed to fetch user details:", error);
          toast.error("Error fetching user details.");
        } finally {
          setLoading(false);
        }
      };
    
      const handleChange = (e) => {
        const { name, value } = e.target;
        setMedicalData((prev) => ({
          ...prev,
          [name]: value,
        }));
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          await axios.put(
            "http://localhost:5000/api/user/update",
            medicalData,
            { withCredentials: true }
          );
    
          toast.success("Details saved successfully!");
          setIsFormSubmitted(true);
        } catch (error) {
          console.error("Error saving medical details:", error);
          toast.error("Failed to save medical details.");
        }
      };
    
      const handleEdit = () => {
        setIsFormSubmitted(false);
      };
    
      if (loading) {
        return (
          <div className="page-background">
            <div className="medical-container loading-spinner">
              <div className="spinner"></div>
              <div>Loading medical details...</div>
            </div>
          </div>
        );
      }
    
      return (
        <div className="page-background">
          <div className="medical-container">
            <h1>Medical Details</h1>
    
            {!isFormSubmitted ? (
              <form className="medical-form" onSubmit={handleSubmit}>
                {[
                  { label: "Age", name: "age", type: "number" },
                  { label: "Regional Nodes Positive", name: "regional_nodes_positive", type: "number" },
                  { label: "Total Tumors", name: "total_tumors", type: "number" },
                  { label: "Tumor Size", name: "tumor_size", type: "number" },
                  { label: "Regional Nodes Examined", name: "regional_nodes_examined", type: "number" },
                  {
                    label: "ER Status",
                    name: "er_status",
                    type: "select",
                    options: ["Positive", "Negative", "Borderline"],
                  },
                  {
                    label: "PR Status",
                    name: "pr_status",
                    type: "select",
                    options: ["Positive", "Negative", "Borderline"],
                  },
                  {
                    label: "HER2 Status",
                    name: "her2_status",
                    type: "select",
                    options: ["Positive", "Negative", "Borderline"],
                  },
                  {
                    label: "Race",
                    name: "race",
                    type: "select",
                    options: ["White", "Black"],
                  },
                ].map(({ label, name, type, options }) => (
                  <div className="form-group" key={name}>
                    <label htmlFor={name}>{label}</label>
                    {type === "select" ? (
                      <select name={name} value={medicalData[name]} onChange={handleChange} required>
                        <option value="">Select {label}</option>
                        {options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={type}
                        name={name}
                        value={medicalData[name]}
                        onChange={handleChange}
                        required
                      />
                    )}
                  </div>
                ))}
    
                <button type="submit" className="submit-btn">Submit</button>
              </form>
            ) : (
              <div className="details-display">
                <h2>Your Medical Details</h2>
                <div className="details-grid">
                  {Object.entries(medicalData).map(([key, value]) => (
                    <div className="detail-item" key={key}>
                      <span className="detail-label">{key.replace(/_/g, " ")}:</span>
                      <span className="detail-value">{value}</span>
                    </div>
                  ))}
                </div>
                <button onClick={handleEdit} className="edit-btn">Edit Details</button>
              </div>
            )}
          </div>
        </div>
      );
};
