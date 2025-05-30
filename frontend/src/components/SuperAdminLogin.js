// SuperAdminLogin.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/login.css";

const SuperAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loginData = {
      super_admin: {
        email,
        password,
        otp_attempt: otp,
      },
    };

    try {
      const response = await fetch(
        "https://api.staging.radiolinq.com/api/v1/super_admin/super_admins/sign_in",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        }
      );

      if (!response.ok) {
        throw new Error("Invalid credentials or OTP.");
      }

      const data = await response.json();
      console.log("Login successful:", data);
      alert("Login successful!");
      navigate("/admin");
    } catch (error) {
      console.error("Login failed:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="left-panel">
        <h1>RadiolinQ</h1>
        <p>Imaging Anytime Anywhere</p>
      </div>
      <div className="right-panel">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
