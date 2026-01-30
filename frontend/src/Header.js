import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CSS/Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faAngleDown, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

export default function Header() {
  const [username, setUsername] = useState('Guest');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
          withCredentials: true, // required to send cookies
        });
        setUsername(response.data.name || 'User');
      } catch (error) {
        console.error('User not logged in or session expired:', error);
        setUsername('Guest');
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {}, {
        withCredentials: true,
      });
      setUsername('Guest');
      window.location.href = '/'; // Redirect to login page
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className={`header ${scrolled ? 'glass-header' : ''}`}>
      <div className="logo">
        <Link to="/home">
          <h1>Br.<span>Care</span></h1>
        </Link>
      </div>

      <nav className="nav">
        <ul className="nav-links">
          <li><Link to="/Home">Home</Link></li>
          <li><Link to="/Condition">Condition</Link></li>
          <li><Link to="/Treatment_details">Your Treatment Details</Link></li>
          <li className="dropdown">
            <Link to="/treatment_plan">
              Treatment Recomandations <FontAwesomeIcon icon={faAngleDown} />
            </Link>
            <div className="dropdown-content">
              <Link to="/Alternative_treatment">Alternative Treatment Plan</Link>
              <Link to="/Treatment_plan">New Treatment Plan</Link>
            </div>
          </li>
        </ul>
      </nav>

      <div className="user-account">
        <div className="user-dropdown">
          <button
            className="user-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <FontAwesomeIcon icon={faUser} />
            <span id="username">{username}</span>
            <FontAwesomeIcon icon={faAngleDown} />
          </button>

          {isDropdownOpen && (
            <div className="user-dropdown-content">
              <Link to="/profile">Profile</Link>
              <Link to="/settings">Settings</Link>
              <button onClick={handleLogout} className="logout-btn">
                Log Out <FontAwesomeIcon icon={faSignOutAlt} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
