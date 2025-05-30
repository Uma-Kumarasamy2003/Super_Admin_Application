import React from "react";
import "../../index.css";
import { LogoutOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="header">
      <span className="user-name">NIVETHITHA HEMACHANDRAN</span>

      <Button type="primary" onClick={handleLogout}>
        <LogoutOutlined />
        Logout
      </Button>
    </div>
  );
};

export default Header;
