import React, { useState, useEffect, useRef } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import HttpClient from "../../HttpClient";

const LogoutComponent = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [isUserInfoVisible, setIsUserInfoVisible] = useState(false);
  const wrapperRef = useRef(null);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await HttpClient.unauthorizedFetch(
        "http://localhost:8080/api/v1/auth/signout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleProfileClick = () => {
    setIsUserInfoVisible(true);
  };

  const handleCloseClick = () => {
    setIsUserInfoVisible(false);
  };

  const handleClickOutside = (event) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setIsUserInfoVisible(false);
    }
  };

  useEffect(() => {
    if (isUserInfoVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserInfoVisible]);

  return (
    <div
      style={{
        position: "fixed",
        top: "30px",
        right: "30px",
        zIndex: 998,
        textAlign: "left",
      }}
    >
      <IconButton
        onClick={handleProfileClick}
        style={{
          width: "45px",
          height: "45px",
          backgroundColor: "#ffffff",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          borderRadius: "50%",
        }}
      >
        <AccountCircleIcon
          style={{
            width: "45px",
            height: "45px",
            color: "#1976d2",
          }}
        />
      </IconButton>

      {isUserInfoVisible && (
        <Paper
          ref={wrapperRef}
          elevation={3}
          style={{
            position: "absolute",
            top: "60px",
            right: "0px",
            padding: "20px",
            borderRadius: "12px",
            width: "300px",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Поточний користувач:</Typography>
            <IconButton
              color="error"
              onClick={handleCloseClick}
              style={{
                minWidth: "24px",
                padding: "5px",
              }}
            >
              <CloseIcon style={{ fontSize: "28px" }} />
            </IconButton>
          </Box>
          <div style={{ padding: "5px" }}>
            <Typography variant="body1">
              <span style={{ fontWeight: "bold", fontStyle: "italic" }}>
                Ім'я:
              </span>{" "}
              <span style={{ fontStyle: "italic" }}>
                {user && `${user.name} ${user.surname}`}
              </span>
            </Typography>
            <Typography variant="body1">
              <span style={{ fontWeight: "bold", fontStyle: "italic" }}>
                Email:
              </span>{" "}
              <span style={{ fontStyle: "italic" }}>{user && user.email}</span>
            </Typography>
          </div>

          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            style={{ marginTop: "10px", display: "block" }}
          >
            Вийти з профілю
          </Button>
        </Paper>
      )}
    </div>
  );
};

export default LogoutComponent;
