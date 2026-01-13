import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

//main component for the landing page view
const LandingPage = () => {
  return (
    //main container wrapper
    <div className="landing-container">
      {/* hero section with welcome message and buttons */}
      <section className="hero-section">
        <h1>WELCOME TO OUR WEBSITE!</h1>
        <p className="hero-title-sub"></p>

        {/* container for the action buttons */}
        <div className="cta-buttons">
          {/* link to the registration page */}
          <Link to="/register">
            <button
              className="custom-btn"
              style={{ fontSize: "1.2rem", padding: "12px 30px" }}
            >
              Get Started
            </button>
          </Link>

          {/* link to the login page */}
          <Link to="/login">
            <button
              className="custom-btn"
              style={{
                border: "2px solid #0d6efd",
                padding: "12px 30px",
                fontSize: "1.2rem"
              }}
            >
              Log in
            </button>
          </Link>
        </div>
      </section>

      {/* section to show team details */}
      <section className="team-section">
        <h2>Meet the Team</h2>
        <div className="team-grid">
          {/* card component for team info */}
          <div className="team-card">
            <h3>About Us</h3>
            <p>
              <strong> Ron Ladin</strong> - Second year Software Engineering
              student at the BIU. my passion is to solve problems and create
              efficient solutions through coding.
              <hr style={{ margin: "20px 0", border: "0", borderTop: "1px solid #eee" }} />
              <strong> Dan Chetirkin</strong> - Second year Software Engineering
              student at Bar-Ilan University, driven by problem-solving and 
              motivated to turn ideas into efficient, practical code.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;