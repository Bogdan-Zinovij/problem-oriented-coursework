import React, { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import SearchPlaceComponent from "./SearchPlaceComponent";
import { InitiativeStatuses } from "../../constants";
import HttpClient from "../../HttpClient";

const MapComponent = ({
  onMarkerAdd,
  onMarkerClick,
  menuOptions,
  searchParams,
  markerToAdd,
  viewedInitiative,
}) => {
  const mapRef = useRef(null);
  const activeMarkerRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const [currentAddedMarker, setCurrentAddedMarker] = useState(null);
  const isUser = user.role === "User";

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    handleMenuOptionsChange();
  }, [menuOptions, searchParams]);

  useEffect(() => {
    handleCreateInitiativeClose();
  }, [markerToAdd]);

  useEffect(() => {
    handleInitiativeViewClose();
  }, [viewedInitiative]);

  const handleInitiativeViewClose = async () => {
    if (viewedInitiative.locationId) {
      removeMarker(viewedInitiative.locationId);
      try {
        const initiativeData = await HttpClient.authorizedFetch(
          `http://localhost:8080/api/v1/initiatives/find-by-location/${viewedInitiative.locationId}`
        );
        const { latitude, longitude } = initiativeData.location;
        const marker = addMarkerToMap(
          [latitude, longitude],
          initiativeData.location.id,
          initiativeData.status
        );
        setMarkers((prevMarkers) => [...prevMarkers, marker]);
      } catch (error) {
        console.error("Error fetching initiative data:", error);
      }
    }
  };

  const initializeMap = () => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([49.0139, 31.2856], 6);

      addTileLayer(mapRef.current);
      showAllInitiatives();
      addGeoJSONLayer(mapRef.current);
      if (isUser) addMapClickHandler(mapRef.current);
    }
  };

  const addTileLayer = (map) => {
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  };

  const addGeoJSONLayer = (map) => {
    HttpClient.unauthorizedFetch("/ukraine.json")
      .then((data) => {
        L.geoJSON(data).addTo(map);
      })
      .catch((error) => {
        console.error("Error while loading GeoJSON:", error);
      });
  };

  const addMapClickHandler = (map) => {
    map.on("click", async function (e) {
      const latlng = [e.latlng.lat, e.latlng.lng];
      const { countryCode, geocode } = await getMarkerLocationInfo(latlng);
      if (countryCode === "UA") {
        const marker = addMarkerToMap(latlng);
        setCurrentAddedMarker((prevMarker) => {
          if (prevMarker) {
            prevMarker.remove();
          }
          return marker;
        });
        selectMarker(marker);
        const markerLocationInfo = {
          latitude: latlng[0],
          longitude: latlng[1],
          geocode,
        };
        onMarkerAdd(markerLocationInfo);
      } else {
        alert("Sorry, but you can add marker only on Ukraine state");
      }
    });
  };

  const getMarkerLocationInfo = async (latlng) => {
    const [lat, lng] = latlng;
    const nominatimEndpoint = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    try {
      const data = await HttpClient.unauthorizedFetch(nominatimEndpoint);
      const countryCode = data.address.country_code.toUpperCase();
      const geocode = data.address["ISO3166-2-lvl4"];

      return { countryCode, geocode };
    } catch (error) {
      console.log("Error getting marker location info");
    }
  };

  const addMarkerToMap = (latlng, locationId, status) => {
    let iconUrl = "/marker-created.png";

    if (status) {
      const statusElement = InitiativeStatuses.find((el) => el.name === status);
      iconUrl = statusElement.iconUrl;
    }

    const marker = L.marker(latlng, {
      icon: new L.icon({
        iconUrl,
        iconSize: [26, 50],
        iconAnchor: [13, 50],
        popupAnchor: [13, 50],
      }),
      locationId,
    })
      .addTo(mapRef.current)
      .on("click", function (event) {
        selectMarker(event.target);
        setCurrentAddedMarker((prevMarker) => {
          if (prevMarker) {
            prevMarker.remove();
          }
          return null;
        });
        onMarkerClick(event.target.options.locationId);
      });

    return marker;
  };

  const selectMarker = (marker) => {
    if (activeMarkerRef.current) {
      activeMarkerRef.current.setOpacity(1);
    }
    activeMarkerRef.current = marker;
    marker.setOpacity(0.5);
  };

  const removeMarker = (locationId) => {
    setMarkers((prevMarkers) => {
      prevMarkers.forEach((marker) => {
        if (marker.options.locationId === locationId) {
          marker.remove();
        }
      });

      return prevMarkers;
    });
  };

  const clearMarkers = () => {
    console.log(markers);
    setMarkers((prevMarkers) => {
      prevMarkers.forEach((marker) => {
        marker.remove();
      });
      return [];
    });
  };

  const handleMenuOptionsChange = () => {
    const menuOptionFunctions = {
      all: showAllInitiatives,
      user: showUserInitiatives,
      popular: showMostPopularInitiatives,
      search: showCustomSearchInitiatives,
    };

    if (menuOptions in menuOptionFunctions) {
      menuOptionFunctions[menuOptions]();
    }
  };

  const showAllInitiatives = () => {
    clearMarkers();
    HttpClient.authorizedFetch("http://localhost:8080/api/v1/initiatives")
      .then((data) => {
        data.forEach((initiative) => {
          const location = initiative.location;
          const marker = addMarkerToMap(
            [location.latitude, location.longitude],
            location.id,
            initiative.status
          );
          setMarkers((prevMarkers) => [...prevMarkers, marker]);
        });
      })
      .catch((error) => {
        console.error("Error while loading markers:", error);
      });
  };

  const showUserInitiatives = () => {
    clearMarkers();
    HttpClient.authorizedFetch(
      `http://localhost:8080/api/v1/initiatives/user/${user.id}`
    )
      .then((data) => {
        data.forEach((initiative) => {
          const location = initiative.location;
          const marker = addMarkerToMap(
            [location.latitude, location.longitude],
            location.id,
            initiative.status
          );
          setMarkers((prevMarkers) => [...prevMarkers, marker]);
        });
      })
      .catch((error) => {
        console.error("Error while loading markers:", error);
      });
  };

  const showCustomSearchInitiatives = () => {
    clearMarkers();
    const queryParams = new URLSearchParams(searchParams);
    HttpClient.authorizedFetch(
      `http://localhost:8080/api/v1/initiatives/find-by-search?${queryParams.toString()}`
    )
      .then((data) => {
        data.forEach((initiative) => {
          const location = initiative.location;
          const marker = addMarkerToMap(
            [location.latitude, location.longitude],
            location.id,
            initiative.status
          );
          setMarkers((prevMarkers) => [...prevMarkers, marker]);
        });
      })
      .catch((error) => {
        console.error("Error while loading markers:", error);
      });
  };

  const showMostPopularInitiatives = () => {
    clearMarkers();
    HttpClient.authorizedFetch(
      `http://localhost:8080/api/v1/initiatives/most-liked`
    )
      .then((data) => {
        data.forEach((initiative) => {
          const location = initiative.location;
          const marker = addMarkerToMap(
            [location.latitude, location.longitude],
            location.id,
            initiative.status
          );
          setMarkers((prevMarkers) => [...prevMarkers, marker]);
        });
        console.log(markers);
      })
      .catch((error) => {
        console.error("Error while loading markers:", error);
      });
  };

  const handleCreateInitiativeClose = () => {
    if (currentAddedMarker) {
      setCurrentAddedMarker((prevMarker) => {
        if (markerToAdd.locationId) {
          prevMarker.options.locationId = markerToAdd.locationId;
          setMarkers((prevMarkers) => [...prevMarkers, prevMarker]);
        } else {
          prevMarker.remove();
        }

        return null;
      });
    }
  };

  const handleSearchPlaceView = async (result) => {
    if (result) {
      const boundingbox = result.boundingbox.map(parseFloat);
      const southwest = [boundingbox[0], boundingbox[2]];
      const northeast = [boundingbox[1], boundingbox[3]];
      const bounds = [southwest, northeast];
      mapRef.current.fitBounds(bounds);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div
        id="map"
        style={{
          zIndex: 0,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      ></div>
      <div
        style={{ zIndex: 1, position: "absolute", top: "20px", left: "440px" }}
      >
        <SearchPlaceComponent onSearch={handleSearchPlaceView} />
      </div>
    </div>
  );
};

export default MapComponent;
