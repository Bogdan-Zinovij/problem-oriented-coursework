import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DeleteIcon from "@mui/icons-material/Delete";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { useFormik } from "formik";
import * as Yup from "yup";
import HttpClient from "../../HttpClient";

const CommentsComponent = ({ initiativeId }) => {
  const [comments, setComments] = useState([]);
  const [sortBy, setSortBy] = useState("likes");
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

      const userCommentsData = commentsData.filter(
        (comment) => comment.user.role === "User"
      );

      const likePromises = userCommentsData.map((comment) => {
        const likePromise = HttpClient.authorizedFetch(
          `http://localhost:8080/api/v1/likes/comments/count-likes/${comment.id}`
        )
          .then((data) => {
            comment.likesCount = +data;
          })
          .catch((error) => {
            console.error("Error fetching likes count:", error);
          });

        const userLikePromise = HttpClient.authorizedFetch(
          `http://localhost:8080/api/v1/likes/comments/user-like?userId=${user.id}&commentId=${comment.id}`
        )
          .then((data) => {
            comment.userLike = data.id ? data : null;
          })
          .catch((error) => {
            console.error("Error fetching user like for comment:", error);
          });

        return Promise.all([likePromise, userLikePromise]);
      });

      await Promise.all(likePromises);

      sortComments(userCommentsData, sortBy);
      setComments(userCommentsData);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleLikeButtonClick = (commentId, userLike) => {
    if (userLike) {
      HttpClient.authorizedFetch(
        `http://localhost:8080/api/v1/likes/comments/${userLike.id}`,
        {
          method: "DELETE",
        }
      )
        .then(() => {
          setComments((prevComments) =>
            prevComments.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    likesCount: comment.likesCount - 1,
                    userLike: null,
                  }
                : comment
            )
          );
        })
        .catch((error) => console.error("Error removing like:", error));
    } else {
      HttpClient.authorizedFetch(
        "http://localhost:8080/api/v1/likes/comments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id, commentId }),
        }
      )
        .then((data) => {
          setComments((prevComments) =>
            prevComments.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    likesCount: comment.likesCount + 1,
                    userLike: data,
                  }
                : comment
            )
          );
        })
        .catch((error) => console.error("Error adding like:", error));
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await HttpClient.authorizedFetch(
        `http://localhost:8080/api/v1/comments/${commentId}`,
        {
          method: "DELETE",
        }
      );
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setComments((prevComments) => {
      const commentsToSort = [...prevComments];
      sortComments(commentsToSort, event.target.value);
      return commentsToSort;
    });
  };

  const sortComments = (commentsData, sortBy) => {
    if (sortBy === "date") {
      commentsData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (sortBy === "likes") {
      commentsData.sort((a, b) => b.likesCount - a.likesCount);
    }
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
        }),
      })
        .then((data) => {
          setComments((prevComments) => [
            ...prevComments,
            { likesCount: 0, userLike: null, ...data },
          ]);
          resetForm();
          sortComments();
        })
        .catch((error) => console.error("Error adding comment:", error))
        .finally(() => setSubmitting(false));
    },
  });

  return (
    <div style={{ marginTop: "16px" }}>
      {!isAdmin && (
        <div>
          <hr style={{ marginTop: "20px", marginBottom: "20px" }} />
          <form onSubmit={formik.handleSubmit}>
            <TextField
              label="Введіть текст коментаря"
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
                formik.touched.newCommentText && formik.errors.newCommentText
              }
            />
            <div
              style={{
                display: "flex",
                marginTop: "8px",
              }}
            >
              <Button
                variant="contained"
                color="secondary"
                onClick={() => formik.resetForm()}
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
                Коментувати
              </Button>
            </div>
          </form>
        </div>
      )}
      <hr style={{ marginTop: "20px", marginBottom: "20px" }} />
      {comments.length > 0 ? (
        <div
          style={{
            marginTop: "16px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body1"
            style={{
              marginLeft: "10px",
              marginRight: "8px",
            }}
          >
            Сортувати за:
          </Typography>
          <FormControl style={{ height: "40px" }}>
            <Select
              value={sortBy}
              onChange={handleSortChange}
              variant="outlined"
              style={{ height: "100%" }}
            >
              <MenuItem value="date">Новизною</MenuItem>
              <MenuItem value="likes">Популярністю</MenuItem>
            </Select>
          </FormControl>
        </div>
      ) : (
        <div style={{ marginTop: "20px" }}>
          ( Коментарі до цієї ініціативи поки відсутні )
        </div>
      )}
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
                display: "flex",
                alignItems: "center",
              }}
            >
              {comment.user.name} {comment.user.surname}
              {isAdmin && (
                <Button
                  onClick={() => handleDeleteComment(comment.id)}
                  style={{ marginLeft: "auto", color: "red" }}
                >
                  <DeleteIcon />
                </Button>
              )}
            </div>
            <p>{comment.text}</p>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={
                  comment.userLike ? <FavoriteIcon /> : <FavoriteBorderIcon />
                }
                onClick={() =>
                  handleLikeButtonClick(comment.id, comment.userLike)
                }
              >
                {comment.likesCount}
              </Button>
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
    </div>
  );
};

export default CommentsComponent;
