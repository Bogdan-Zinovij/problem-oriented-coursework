import React, { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CloseIcon from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid";
import DeleteIcon from "@mui/icons-material/Delete";
import CommentsComponent from "./CommentsComponent";
import AdminNotesComponent from "./AdminNotesComponent";
import { InitiativeStatuses } from "../../constants";
import HttpClient from "../../HttpClient";

const ViewInitiativeComponent = ({ locationId, onClose }) => {
  const [initiative, setInitiative] = useState(null);
  const [likesInfo, setLikesInfo] = useState({ userLike: null, likesCount: 0 });
  const [showUserComments, setShowUserComments] = useState(false);
  const [showAdminNotes, setShowAdminNotes] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user.role === "Admin";

  useEffect(() => {
    fetchInitiativeData();
  }, [locationId]);

  const fetchInitiativeData = async () => {
    try {
      const initiativeData = await HttpClient.authorizedFetch(
        `http://localhost:8080/api/v1/initiatives/find-by-location/${locationId}`
      );
      const imagesData = await HttpClient.authorizedFetch(
        `http://localhost:8080/api/v1/images/initiative/${initiativeData.id}`
      );
      const likesData = await HttpClient.authorizedFetch(
        `http://localhost:8080/api/v1/likes/initiatives/user-like?userId=${user.id}&initiativeId=${initiativeData.id}`
      );
      const likesCountData = await HttpClient.authorizedFetch(
        `http://localhost:8080/api/v1/likes/initiatives/count-likes/${initiativeData.id}`
      );

      setInitiative({ ...initiativeData, images: imagesData });
      setLikesInfo({
        userLike: likesData.id ? likesData : null,
        likesCount: +likesCountData,
      });
    } catch (error) {
      console.error("Error fetching initiative data:", error);
    }
  };

  const deleteUserLike = async () => {
    try {
      await HttpClient.authorizedFetch(
        `http://localhost:8080/api/v1/likes/initiatives/${likesInfo.userLike.id}`,
        {
          method: "DELETE",
        }
      );
      setLikesInfo((prevInfo) => ({
        ...prevInfo,
        userLike: null,
        likesCount: prevInfo.likesCount - 1,
      }));
    } catch (error) {
      console.error("Error deleting like:", error);
    }
  };

  const addUserLike = async () => {
    try {
      const data = await HttpClient.authorizedFetch(
        "http://localhost:8080/api/v1/likes/initiatives",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            initiativeId: initiative.id,
          }),
        }
      );
      setLikesInfo((prevInfo) => ({
        ...prevInfo,
        userLike: data,
        likesCount: prevInfo.likesCount + 1,
      }));
    } catch (error) {
      console.error("Error adding like:", error);
    }
  };

  const handleLikeButtonClick = async () => {
    try {
      if (likesInfo.userLike) {
        await deleteUserLike();
      } else {
        await addUserLike();
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  const handleDeleteInitiative = async (initiativeId) => {
    try {
      await HttpClient.authorizedFetch(
        `http://localhost:8080/api/v1/initiatives/${initiativeId}`,
        {
          method: "DELETE",
        }
      );
      onClose();
    } catch (error) {
      console.error("Error deleting initiative:", error);
    }
  };

  const toggleUserComments = () => {
    setShowAdminNotes(false);
    setShowUserComments(!showUserComments);
  };

  const toggleAdminComments = () => {
    setShowUserComments(false);
    setShowAdminNotes(!showAdminNotes);
  };

  const getStatusColor = () => {
    const status = InitiativeStatuses.find(
      (status) => status.name === initiative.status
    );
    return status ? status.color : "black";
  };

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
      {!initiative && <div>Loading...</div>}
      {initiative && (
        <>
          <Grid container alignItems="center">
            <Grid item xs={11}>
              <Typography variant="h5">Перегляд ініціативи</Typography>
            </Grid>
            <Grid item xs={1}>
              <Button color="error" onClick={onClose}>
                <CloseIcon style={{ fontSize: "32px" }} />
              </Button>
            </Grid>
          </Grid>

          <hr style={{ marginTop: "20px", marginBottom: "20px" }} />
          <Grid
            container
            spacing={2}
            style={{ fontSize: "1.05em", padding: "10px" }}
          >
            <Grid item xs={1.5}>
              {" "}
              <Typography variant="body1">Назва:</Typography>
            </Grid>
            <Grid item xs={10.5}>
              {" "}
              <Typography variant="body1" fontStyle="italic" fontWeight="bold">
                {initiative.title}
              </Typography>
            </Grid>
            <Grid item xs={1.5}>
              <Typography variant="body1">Тема:</Typography>
            </Grid>
            <Grid item xs={10.5}>
              <Typography variant="body1" fontStyle="italic">
                {initiative.topic ? initiative.topic.name : "Select topic"}
              </Typography>
            </Grid>
            <Grid item xs={1.5}>
              <Typography variant="body1">Автор:</Typography>
            </Grid>
            <Grid item xs={10.5}>
              <Typography variant="body1" fontStyle="italic">
                {initiative.user.name + " " + initiative.user.surname}
              </Typography>
            </Grid>
            <Grid item xs={1.5}>
              {" "}
              <Typography variant="body1">Статус:</Typography>
            </Grid>
            <Grid item xs={10.5}>
              {" "}
              <Typography
                variant="body1"
                fontStyle="italic"
                style={{ color: getStatusColor() }}
              >
                {initiative.status}
              </Typography>
            </Grid>
            <Grid item xs={1.5}>
              <Typography variant="body1">Опис:</Typography>
            </Grid>
            <Grid item xs={10.5}>
              <Typography variant="body1" fontStyle="italic">
                {initiative.description}
              </Typography>
            </Grid>
            <Grid item xs={1.5}>
              {" "}
              <div>
                {initiative.images && (
                  <Typography variant="body1">Фото:</Typography>
                )}
              </div>
            </Grid>
            <Grid item xs={10.5}>
              {" "}
              <div>
                {initiative.images &&
                  initiative.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.src}
                      alt={`Initiative img ${index + 1}`}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "400px",
                        height: "auto",
                        width: "auto",
                        borderRadius: "8px",
                      }}
                    />
                  ))}
              </div>
            </Grid>
          </Grid>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "15px",
              justifyContent: "space-between",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={
                likesInfo.userLike ? <FavoriteIcon /> : <FavoriteBorderIcon />
              }
              onClick={handleLikeButtonClick}
              style={{ marginRight: "10px" }}
            >
              {likesInfo.likesCount}
            </Button>
            {isAdmin && (
              <Button
                onClick={() => handleDeleteInitiative(initiative.id)}
                style={{ marginLeft: "auto", color: "red" }}
              >
                <DeleteIcon />
              </Button>
            )}
            <div>
              <Typography variant="body2">Дата створення:</Typography>
              <Typography marginLeft="auto" variant="body2">
                {new Date(initiative.createdAt).toLocaleString("uk-UA", {
                  timeZone: "Europe/Kyiv",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </Typography>
            </div>
          </div>
          <hr style={{ marginTop: "20px", marginBottom: "20px" }} />
          <Button
            variant="contained"
            color={showUserComments ? "secondary" : "primary"}
            onClick={toggleUserComments}
          >
            {showUserComments ? "Сховати коментарі" : "Коментарі користувачів"}
          </Button>
          <Button
            style={{ marginLeft: "10px" }}
            variant="contained"
            color={showAdminNotes ? "secondary" : "primary"}
            onClick={toggleAdminComments}
          >
            {showAdminNotes ? "Сховати відповіді" : "Відповіді адміністратора"}
          </Button>
          {showUserComments && (
            <CommentsComponent
              initiativeId={initiative.id}
              style={{ marginTop: "40px" }}
            />
          )}
          {showAdminNotes && (
            <AdminNotesComponent
              initiativeId={initiative.id}
              style={{ marginTop: "40px" }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ViewInitiativeComponent;
