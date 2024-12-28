import React, { useState, useRef, useCallback } from "react";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";

const MenuComponent = ({ handleMenuOptionSelect }) => {
  const [selectedOption, setSelectedOption] = useState("all");
  const [anchorEl, setAnchorEl] = useState(null);
  const menuButtonRef = useRef(null);

  const handleOptionSelect = useCallback(
    (option) => {
      setSelectedOption(option);
      handleMenuOptionSelect(option);
      setAnchorEl(null);
    },
    [handleMenuOptionSelect]
  );

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "60px",
        zIndex: 999,
        textAlign: "left",
      }}
    >
      <Button
        ref={menuButtonRef}
        onClick={handleMenuOpen}
        variant="contained"
        color="primary"
        style={{ margin: "8px", height: "40px" }}
      >
        Меню
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          selected={selectedOption === "all"}
          onClick={() => handleOptionSelect("all")}
        >
          <Typography variant="body1">Всі ініціативи</Typography>
        </MenuItem>
        <MenuItem
          selected={selectedOption === "user"}
          onClick={() => handleOptionSelect("user")}
        >
          <Typography variant="body1">Мої додані ініціативи</Typography>
        </MenuItem>
        <MenuItem
          selected={selectedOption === "popular"}
          onClick={() => handleOptionSelect("popular")}
        >
          <Typography variant="body1">Найпопулярніші ініціативи</Typography>
        </MenuItem>
        <MenuItem
          selected={selectedOption === "search"}
          onClick={() => handleOptionSelect("search")}
        >
          <Typography variant="body1">Розширений пошук</Typography>
        </MenuItem>
        <MenuItem
          selected={selectedOption === "statistics"}
          onClick={() => handleOptionSelect("statistics")}
        >
          <Typography variant="body1">Статистика</Typography>
        </MenuItem>
      </Menu>
    </div>
  );
};

export default MenuComponent;
