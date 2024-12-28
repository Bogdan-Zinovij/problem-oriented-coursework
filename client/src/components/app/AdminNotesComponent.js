import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { InitiativeStatuses } from "../../constants";
import { useFormik } from "formik";
import * as Yup from "yup";
import HttpClient from "../../HttpClient";

const AdminNotesComponent = ({ initiativeId }) => {
  const [comments, setComments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [image, setImage] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user.role === "Admin";

  useEffect(() => {
    fetchComments();
  }, [initiativeId]);

  const fetchComments = async () => {
    try {
      const commentsData = await HttpClient.authorizedFetch(
        `http://localhost:8080/api/v1/comments/initiative/${initiativeId}`
      );

      const adminCommentsData = commentsData.filter(
        (comment) => comment.user.role === "Admin"
      );

      sortComments(adminCommentsData);
      setComments(adminCommentsData);
    } catch (error) {
      console.error("Error fetching comments:", error);
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

  const sortComments = (commentsData) => {
    commentsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const formik = useFormik({
    initialValues: {
      newCommentText: "",
    },
    validationSchema: Yup.object({
      newCommentText: Yup.string()
        .trim()
        .min(1, "Коментар має містити хоча б один символ")
        .max(512, "Максимальна довжина коментаря - 512 символів")
        .required("Коментар не може бути порожнім"),
    }),
    onSubmit: (values, { setSubmitting, resetForm }) => {
      HttpClient.authorizedFetch("http://localhost:8080/api/v1/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          initiativeId,
          text: values.newCommentText,
          imageId: image ? image.id : undefined,
        }),
      })
        .then((data) => {
          setComments((prevComments) => [
            { likesCount: 0, userLike: null, ...data },
            ...prevComments,
          ]);
          resetForm();
          setImage(null);
        })
        .catch((error) => console.error("Error adding comment:", error))
        .finally(() => setSubmitting(false));
    },
  });

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    try {
      await HttpClient.authorizedFetch(
        `http://localhost:8080/api/v1/initiatives/change-status/${initiativeId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );
      setSelectedStatus(newStatus);
    } catch (error) {
      console.error("Error changing status:", error);
    }
  };

  return (
    <div style={{ marginTop: "16px" }}>
      <div style={{ marginTop: "16px" }}>
        {isAdmin && (
          <div>
            <div style={{ marginTop: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginLeft: "10px",
                  marginBottom: "10px",
                }}
              >
                <Typography
                  variant="body1"
                  style={{
                    marginRight: "10px",
                    width: "350px",
                    whiteSpace: "nowrap",
                  }}
                  noWrap
                >
                  Змінити статус ініціативи:
                </Typography>
                <FormControl fullWidth style={{ height: "40px" }}>
                  <Select
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    displayEmpty
                    style={{ height: "100%" }}
                    inputProps={{ "aria-label": "Select Status" }}
                  >
                    <MenuItem value="" disabled>
                      ( Оберіть статус )
                    </MenuItem>
                    {InitiativeStatuses.map((status) => (
                      <MenuItem key={status.name} value={status.name}>
                        {status.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>

            <div
              style={{
                border: "1px solid #ccc",
                padding: "8px",
                borderRadius: "8px",
                marginBottom: "8px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <form onSubmit={formik.handleSubmit}>
                <TextField
                  label="Текст відповіді адміністратора"
                  name="newCommentText"
                  value={formik.values.newCommentText}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  multiline
                  fullWidth
                  variant="outlined"
                  error={
                    formik.touched.newCommentText &&
                    Boolean(formik.errors.newCommentText)
                  }
                  helperText={
                    formik.touched.newCommentText &&
                    formik.errors.newCommentText
                  }
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "16px",
                  }}
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
                      <Typography variant="body2">
                        {image.fileNameWithExt}
                      </Typography>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", marginTop: "8px" }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={formik.handleReset}
                    style={{ marginRight: "8px" }}
                    disabled={formik.isSubmitting}
                  >
                    Відміна
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={formik.isSubmitting}
                  >
                    Відправити
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
        {comments.length ? (
          <div style={{ marginTop: "16px" }}>
            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontWeight: "600",
                    fontStyle: "italic",
                    marginBottom: "4px",
                  }}
                >
                  {comment.user.name} {comment.user.surname}
                </div>
                <p>{comment.text}</p>
                <div>
                  {comment.images &&
                    comment.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.src}
                        alt={`img ${index + 1}`}
                        style={{
                          maxWidth: "100%",
                          height: "auto",
                          borderRadius: "8px",
                          marginTop: "20px",
                        }}
                      />
                    ))}
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ marginLeft: "auto" }}>
                    {new Date(comment.createdAt).toLocaleString("uk-UA", {
                      timeZone: "Europe/Kyiv",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: "20px" }}>
            ( Відповіді адміністраторів наразі відсутні )
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotesComponent;
