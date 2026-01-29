import "./CSS/Treatment_plan.css";
import "bootstrap";
import axios from 'axios';
import { useState, useEffect } from "react";

export default function Treatment_plan() {
    const [medicalDetails, setMedicalDetails] = useState(null);
    const [treatmentPlan, setTreatmentPlan] = useState(null);
    const [showPrediction, setShowPrediction] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const fetchMedicalDetails = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get('https://breast-cancer-treatment-prediction.onrender.com/api/user/details', {
            withCredentials: true,
          });
          setMedicalDetails(response.data);
          setError(null);
        } catch (error) {
          console.error('Error fetching medical details:', error);
          setError('Failed to load medical details.');
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchMedicalDetails();
    }, []);
  
    const predictTreatment = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post(
          'http://localhost:5000/api/treatment/predict',
          {},
          { withCredentials: true }
        );
        setTreatmentPlan(response.data);
        setShowPrediction(true);
        setError(null);
      } catch (error) {
        console.error('Error predicting treatment:', error);
        setError('Prediction failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
  
    const formatKey = (key) => {
      const mapping = {
        "radiation recode": "Radiation Therapy",
        "chemotherapy recode": "Chemo Therapy"
      };
      
      const formatted = key.replace(/_/g, ' ').toLowerCase();
      return mapping[formatted] || formatted.replace(/\b\w/g, (char) => char.toUpperCase());
    };
      
    const formatValue = (value) => {
      if (typeof value === 'string' && ['no', 'nan', 'NaN'].includes(value.toLowerCase())) {
        return 'Not Required';
      }
      return value;
    };
  
    const renderObject = (obj) => {
      return Object.entries(obj).map(([key, val], idx) => (
        key.toLowerCase() === 'status' && val.toLowerCase() === 'success' ? null : (
          <p key={idx}>
            <strong>{formatKey(key)}:</strong> {formatValue(val)}
          </p>
        )
      ));
    };
  
    return (
      <div className="treatment-wrapper">
        <h2 className="treatment-title">Patient Medical Details</h2>
        {error && <p className="error-message">{error}</p>}
  
        {isLoading ? (
          <div className="loading-indicator"></div>
        ) : medicalDetails ? (
          <div className="medical-info-box">
            {Object.entries(medicalDetails.user || medicalDetails).map(([key, value], index) => (
              <div key={index} className="info-row">
                <strong>{formatKey(key)}:</strong>{' '}
                {typeof value === 'object' && value !== null
                  ? renderObject(value)
                  : formatValue(value)}
              </div>
            ))}
          </div>
        ) : (
          <p className="error-message">No medical details available.</p>
        )}
  
        <button 
          className="action-button" 
          onClick={predictTreatment}
          disabled={isLoading || !medicalDetails}
        >
          {isLoading ? 'Processing...' : 'Predict Treatment Plan'}
        </button>
  
        {showPrediction && treatmentPlan && (
          <div className="results-container">
            <h2 className="results-title">Recommended Treatment Plan</h2>
            {Object.entries(treatmentPlan).map(([key, value], index) => {
              if (key.toLowerCase() === 'status' || key.toLowerCase() === 'user') return null;
              return (
                <div className="treatment-result" key={index}>
                  {typeof value === 'object' && value !== null
                    ? renderObject(value)
                    : <p>{formatValue(value)}</p>}
                    <br/>
                  <p className="disclaimer-text">It is a data-model based prediction so it is advisable to cosult your doctor or a specialist first.</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
}
