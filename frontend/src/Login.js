import "./CSS/Login.css";
import "bootstrap";
import { useState } from "react";
import axios from 'axios';

export default function Login() {
  const [formData, setFormData] = useState({
    name: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });

      console.log('Login successful:', response.data);

      localStorage.setItem('user', JSON.stringify({ name: response.data.name, id: response.data.userId }));
      localStorage.setItem('token', response.data.token);
      window.location.href = '/Home';
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="form-overlay">
        <div className="login-card">
          <div className="login-header">
            <h1>Breast Cancer Treatment Prediction</h1>
            <h2>Login</h2>
          </div>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Username</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="register-link">
            Don't have an account? <a href="/signup">Register here</a>
          </p>
        </div>
      </div>
    </div>
  );
}
