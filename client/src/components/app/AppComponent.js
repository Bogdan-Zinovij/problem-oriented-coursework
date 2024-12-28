import React, { useState } from "react";
import MapComponent from "./MapComponent";
import CreateInitiativeComponent from "./CreateInitiativeComponent";
import ViewInitiativeComponent from "./ViewInitiativeComponent";
import LogoutComponent from "../auth/LogoutComponent";
import MenuComponent from "./MenuComponent";
import SearchInitiativeComponent from "./SearchInitiativeComponent";
import "../../App.css";
import StatisticsComponent from "./StatisticsComponent";

const AppComponent = () => {
  const [showCreateInitiative, setShowCreateInitiative] = useState(false);
  const [showViewInitiative, setShowViewInitiative] = useState(false);
  const [markerLocationInfo, setMarkerLocationInfo] = useState(null);
  const [locationId, setLocationId] = useState(null);
  const [menuOptions, setMenuOptions] = useState(null);
  const [searchParams, setSearchParams] = useState({});
  const [markerToAdd, setMarkerToAdd] = useState({ locationId: undefined });
  const [viewedInitiative, setViewedInitiative] = useState({
    locationId: undefined,
  });

  const handleMarkerAdd = (markerLocation) => {
    setMarkerLocationInfo(markerLocation);
    setShowViewInitiative(false);
    setShowCreateInitiative(true);
  };

  const handleMarkerClick = (markerLocationId) => {
    setLocationId(markerLocationId);
    setShowCreateInitiative(false);
    setShowViewInitiative(true);
  };

  const handleCreateInitiativeClose = (markerLocationId) => {
    setShowCreateInitiative(false);
    setLocationId(markerLocationId);
    setShowViewInitiative(true);
    setMarkerToAdd({ locationId: markerLocationId });
  };

  const handleViewInitiativeClose = () => {
    setViewedInitiative({ locationId });
    setShowViewInitiative(false);
  };

  const handleMenuOptionSelect = (option) => {
    setMenuOptions(option);
    if (option !== "search") {
      setSearchParams({});
    }
  };

  const handleSearch = (params) => {
    setSearchParams(params);
  };

  const handleMenuClose = () => {
    setSearchParams({});
    setMenuOptions("all");
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        margin: "0",
      }}
    >
      <MapComponent
        onMarkerAdd={handleMarkerAdd}
        onMarkerClick={handleMarkerClick}
        menuOptions={menuOptions}
        searchParams={searchParams}
        markerToAdd={markerToAdd}
        viewedInitiative={viewedInitiative}
      />
      {showCreateInitiative && (
        <CreateInitiativeComponent
          markerLocationInfo={markerLocationInfo}
          onClose={handleCreateInitiativeClose}
        />
      )}
      {showViewInitiative && locationId && (
        <ViewInitiativeComponent
          locationId={locationId}
          onClose={handleViewInitiativeClose}
        />
      )}
      <LogoutComponent />
      <MenuComponent handleMenuOptionSelect={handleMenuOptionSelect} />
      {menuOptions === "search" && (
        <SearchInitiativeComponent
          onSearch={handleSearch}
          onClose={handleMenuClose}
        />
      )}
      {menuOptions === "statistics" && (
        <StatisticsComponent onClose={handleMenuClose} />
      )}
    </div>
  );
};

export default AppComponent;
