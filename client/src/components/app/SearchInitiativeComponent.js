import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CloseIcon from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import * as Yup from "yup";
import { format, parse, isValid } from "date-fns";
import { InitiativeStatuses } from "../../constants";
import HttpClient from "../../HttpClient";

const SearchInitiativeComponent = ({ onSearch, onClose }) => {
  const [themes, setThemes] = useState([]);
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    fetchThemes();
    fetchRegions();
  }, []);

  const fetchThemes = async () => {
    try {
      const data = await HttpClient.authorizedFetch(
        "http://localhost:8080/api/v1/topics"
      );
      setThemes(data);
    } catch (error) {
      console.error("Error fetching themes:", error);
    }
  };

  const fetchRegions = async () => {
    try {
      const data = await HttpClient.authorizedFetch(
        "http://localhost:8080/api/v1/regions"
      );
      setRegions(data);
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string()
      .max(128, "Назва не може бути більше 128 символів")
      .test(
        "notEmpty",
        "Назва не може складатися лише з пустих символів",
        (value) => {
          return !value || value.trim().length > 0;
        }
      ),
    createdAtStart: Yup.string().test(
      "isValidDate",
      "Дата повинна бути у форматі дд.мм.рррр",
      (value) => {
        if (!value) return true; // Allow empty field
        const date = parse(value, "dd.MM.yyyy", new Date());
        return isValid(date);
      }
    ),
    createdAtEnd: Yup.string().test(
      "isValidDate",
      "Дата повинна бути у форматі дд.мм.рррр",
      (value) => {
        if (!value) return true; // Allow empty field
        const date = parse(value, "dd.MM.yyyy", new Date());
        return isValid(date);
      }
    ),
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      topicId: "",
      status: "",
      regionId: "",
      createdAtStart: "",
      createdAtEnd: "",
    },
    validationSchema,
    onSubmit: (values) => {
      const queryParams = {};
      for (const key in values) {
        if (values[key]) {
          if (key === "createdAtStart" || key === "createdAtEnd") {
            const date = parse(values[key], "dd.MM.yyyy", new Date());
            queryParams[key] = format(date, "yyyy-MM-dd");
          } else {
            queryParams[key] = values[key];
          }
        }
      }
      onSearch(queryParams);
    },
  });

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        backgroundColor: "#ffffff",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        zIndex: 998,
        textAlign: "left",
        padding: "20px",
        borderRadius: "12px",
        maxWidth: "500px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <Typography variant="h5" padding="10px">
          Пошук ініціатив
        </Typography>
        <Button color="error" onClick={onClose}>
          <CloseIcon style={{ fontSize: "28px" }} />
        </Button>
      </div>
      <form onSubmit={formik.handleSubmit} padding="10px">
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Назва"
              placeholder="Введіть назву"
              fullWidth
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              name="topicId"
              value={formik.values.topicId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Тема"
              fullWidth
            >
              <MenuItem value="">Всі теми</MenuItem>
              {themes.map((theme) => (
                <MenuItem key={theme.id} value={theme.id}>
                  {theme.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Статус"
              fullWidth
            >
              <MenuItem value="">Всі статуси</MenuItem>
              {InitiativeStatuses.map((status) => (
                <MenuItem key={status.name} value={status.name}>
                  {status.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              name="regionId"
              value={formik.values.regionId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Область"
              fullWidth
            >
              <MenuItem value="">Вся територія України</MenuItem>
              {regions.map((region) => (
                <MenuItem key={region.id} value={region.id}>
                  {region.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Початкова дата створення"
              value={formik.values.createdAtStart}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              name="createdAtStart"
              placeholder="дд.мм.рррр"
              fullWidth
              error={
                formik.touched.createdAtStart &&
                Boolean(formik.errors.createdAtStart)
              }
              helperText={
                formik.touched.createdAtStart && formik.errors.createdAtStart
              }
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Кінцева дата створення"
              value={formik.values.createdAtEnd}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              name="createdAtEnd"
              placeholder="дд.мм.рррр"
              fullWidth
              error={
                formik.touched.createdAtEnd &&
                Boolean(formik.errors.createdAtEnd)
              }
              helperText={
                formik.touched.createdAtEnd && formik.errors.createdAtEnd
              }
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              style={{ borderRadius: "8px" }}
              fullWidth
            >
              <SearchIcon />
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default SearchInitiativeComponent;
