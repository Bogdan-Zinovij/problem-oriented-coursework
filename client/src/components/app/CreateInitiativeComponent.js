import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CreateIcon from "@mui/icons-material/Create";
import { useFormik } from "formik";
import * as Yup from "yup";
import HttpClient from "../../HttpClient";

const CreateInitiativeComponent = ({ markerLocationInfo, onClose }) => {
  const [topics, setTopics] = useState([]);
  const [image, setImage] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const data = await HttpClient.authorizedFetch(
        "http://localhost:8080/api/v1/topics"
      );
      setTopics(data);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const handleImageChange = async (event) => {
    const imageFile = event.target.files[0];

    if (!imageFile) {
      return;
    }

    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const result = await HttpClient.authorizedFetch(
        "http://localhost:8080/api/v1/images",
        {
          method: "POST",
          body: formData,
        }
      );
      setImage(result);
      console.log("Created image ID:", result.id);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      selectedTopic: "",
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .trim()
        .min(1, "Назва має містити хоча б один символ")
        .max(128, "Максимальна довжина назви - 128 символів")
        .required("Назва не може бути порожньою"),
      description: Yup.string()
        .trim()
        .min(1, "Опис має містити хоча б один символ")
        .max(512, "Максимальна довжина опису - 512 символів")
        .required("Опис не може бути порожнім"),
      selectedTopic: Yup.string().required("Тема має бути обов'язково обрана"),
    }),
    onSubmit: async (values) => {
      const data = {
        title: values.title,
        description: values.description,
        topicId: values.selectedTopic,
        userId: user.id,
        location: markerLocationInfo,
        imageId: image ? image.id : undefined,
      };
      console.log(data);

      try {
        const result = await HttpClient.authorizedFetch(
          "http://localhost:8080/api/v1/initiatives",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );
        console.log(result);
        alert("Ініціатива створена успішно!");
        onClose(result.location.id);
      } catch (error) {
        console.error("Error creating initiative:", error);
      }
    },
  });

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 999,
        padding: "40px",
        top: "20px",
        right: "20px",
        width: "calc(100% / 3)",
        flex: "none",
        overflowY: "auto",
        maxHeight: "85vh",
        borderRadius: "10px",
        backgroundColor: "#ffffff",
        border: "1px solid #ccc",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography variant="h5">
        Створення ініціативи
        <CreateIcon
          style={{ verticalAlign: "bottom", marginLeft: "20px", color: "blue" }}
        />
      </Typography>

      <hr style={{ marginTop: "20px", marginBottom: "20px" }} />
      <form onSubmit={formik.handleSubmit}>
        <TextField
          label="Назва"
          variant="outlined"
          fullWidth
          margin="normal"
          name="title"
          value={formik.values.title}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.title && Boolean(formik.errors.title)}
          helperText={formik.touched.title && formik.errors.title}
        />
        <Grid container alignItems="center">
          <Grid item xs={4}>
            <Typography marginLeft="10px" variant="body1">
              Тема:
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Select
              name="selectedTopic"
              value={formik.values.selectedTopic}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fullWidth
              variant="outlined"
              error={
                formik.touched.selectedTopic &&
                Boolean(formik.errors.selectedTopic)
              }
            >
              <MenuItem value="" disabled>
                ( Оберіть тему )
              </MenuItem>
              {topics.map((topic) => (
                <MenuItem key={topic.id} value={topic.id}>
                  {topic.name}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.selectedTopic && formik.errors.selectedTopic && (
              <Typography color="error" variant="body2">
                {formik.errors.selectedTopic}
              </Typography>
            )}
          </Grid>
        </Grid>
        <TextField
          label="Опис"
          variant="outlined"
          fullWidth
          multiline
          rows={6}
          margin="normal"
          name="description"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            formik.touched.description && Boolean(formik.errors.description)
          }
          helperText={formik.touched.description && formik.errors.description}
        />
        <div
          style={{ display: "flex", alignItems: "center", marginTop: "16px" }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
            id="upload-button"
          />
          <label htmlFor="upload-button">
            <Button variant="outlined" component="span">
              Додати зображення
            </Button>
          </label>
          {image && (
            <div
              style={{
                marginLeft: "16px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src={image.src}
                alt={image.fileNameWithExt}
                style={{
                  maxWidth: "50px",
                  maxHeight: "50px",
                  marginRight: "8px",
                }}
              />
              <Typography variant="body2">{image.fileNameWithExt}</Typography>
            </div>
          )}
        </div>
        <div style={{ textAlign: "right", marginTop: "16px" }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => onClose(null)}
          >
            Відміна
          </Button>

          <span style={{ marginRight: "10px" }} />
          <Button variant="contained" color="primary" type="submit">
            Створити
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateInitiativeComponent;
