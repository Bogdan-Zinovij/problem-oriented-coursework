import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import HttpClient from "../../HttpClient";

const SearchPlaceComponent = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    if (query.trim() !== "") {
      try {
        const data = await HttpClient.unauthorizedFetch(
          `https://nominatim.openstreetmap.org/search?countrycodes=UA&q=${query}&format=json&limit=4`
        );
        setSearchResults(data);
      } catch (error) {
        console.error(
          "Error fetching data from nominatim.openstreetmap.org:",
          error
        );
      }
    }
  };

  const handleResultClick = (result) => {
    onSearch(result);
    setSearchResults([]);
  };

  const clearSearchResults = () => {
    setSearchResults([]);
  };

  return (
    <div style={{ marginTop: "5px", marginLeft: "180px" }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Введіть місце для пошуку"
        style={{
          padding: "10px",
          width: "195px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginRight: "10px",
          fontSize: "1em",
        }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSearch}
        style={{ borderRadius: "8px" }}
      >
        <SearchIcon style={{ height: "28px" }} />
      </Button>
      <div style={{ marginTop: "10px", width: "400px" }}>
        {searchResults.length > 0 && (
          <div
            style={{
              borderRadius: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.9)", // прозорий білий фон
              padding: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "10px",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6">Результати пошуку:</Typography>
              <Button color="error" onClick={clearSearchResults}>
                <CloseIcon />
              </Button>
            </div>
            <div
              style={{
                borderRadius: "8px",
                padding: "10px",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {searchResults.map((result) => (
                <React.Fragment key={result.place_id}>
                  <div
                    onClick={() => handleResultClick(result)}
                    style={{
                      cursor: "pointer",
                      marginBottom: "5px",
                      border: "1px solid #ccc",
                      paddingBottom: "5px",
                    }}
                  >
                    <Typography
                      style={{ fontStyle: "normal", padding: "5px" }} // відключаємо курсив
                      onMouseEnter={(e) => {
                        e.target.style.fontStyle = "italic"; // змінюємо на курсив при наведенні
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.fontStyle = "normal"; // повертаємо звичайний шрифт при знятті наведення
                      }}
                    >
                      {result.display_name}
                    </Typography>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPlaceComponent;
