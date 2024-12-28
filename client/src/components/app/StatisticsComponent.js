import React, { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { RadialChart } from "react-vis";
import CloseIcon from "@mui/icons-material/Close";
import { InitiativeStatuses } from "../../constants";
import HttpClient from "../../HttpClient";

const StatisticsComponent = ({ onClose }) => {
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const data = await HttpClient.authorizedFetch(
        "http://localhost:8080/api/v1/initiatives/month-statistics"
      );

      setStatistics({ ...data });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  if (!statistics) {
    return null;
  }

  const statusCounts = statistics.statusCounts.map((element) => {
    console.log(element);
    const status = InitiativeStatuses.find(
      (status) => status.name === element.status
    );

    return {
      ...element,
      color: status.color ? status.color : "black",
    };
  });

  const totalCount = statistics.statusCounts.reduce(
    (acc, item) => acc + parseInt(item.count),
    0
  );

  const sortedThemes = statistics.topThemes.sort(
    (a, b) => parseInt(b.count) - parseInt(a.count)
  );

  const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"];

  let chartData = sortedThemes.slice(0, 4).map((item, index) => ({
    label: item.topic_name,
    angle: parseInt(item.count),
    color: colors[index],
  }));

  const otherCount =
    totalCount - chartData.reduce((acc, data) => acc + data.angle, 0);

  if (otherCount > 0) {
    chartData.push({
      label: "Інші теми",
      angle: otherCount,
      color: "#808080",
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        backgroundColor: "#ffffff",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        textAlign: "left",
        padding: "20px",
        borderRadius: "12px",
        width: "500px",
      }}
    >
      <div
        style={{
          marginLeft: "10px",
          marginTop: "10px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h5">Статистика</Typography>
        <Button color="error" onClick={onClose}>
          <CloseIcon style={{ fontSize: "28px" }} />
        </Button>
      </div>
      <div style={{ padding: "20px" }}>
        <div>
          <Typography variant="h6">1. Найпопулярніші теми:</Typography>
          <div style={{ height: "200px", position: "relative" }}>
            <RadialChart
              data={chartData}
              width={200}
              height={200}
              showLabels={false}
              colorType="literal"
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "250px",
                transform: "translateY(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
              }}
            >
              {chartData.map((dataItem, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: dataItem.color,
                      marginRight: "5px",
                      borderRadius: "50%",
                    }}
                  ></div>
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginLeft: "5px",
                      fontSize: "1.05em",
                    }}
                  >
                    {dataItem.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <div style={{ width: "320px" }}>
            <Typography variant="h6">
              2. Кількість звернень за статусами:
            </Typography>
            <div style={{ marginLeft: "20px", marginTop: "15px" }}>
              {statusCounts.map((item, index) => (
                <div key={index} style={{ marginBottom: "5px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: "10px",
                      height: "10px",
                      backgroundColor: item.color,
                      marginRight: "5px",
                      borderRadius: "50%",
                    }}
                  ></span>
                  <span style={{ marginLeft: "5px", fontSize: "1.05em" }}>
                    {item.status}: {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginLeft: "40px", width: "350px" }}>
            <Typography variant="h6">
              3. Міста з найбільшою кількістю звернень:
            </Typography>
            <ol>
              {statistics.topCities.map((item, index) => (
                <li key={index} style={{ fontSize: "1.05em", padding: "2px" }}>
                  {item.region_name}: {item.count}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsComponent;
