import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { useNavigate } from "react-router-dom";
import HttpClient from "../../HttpClient";

const LoginComponent = () => {
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Невірний формат електронної пошти")
      .min(8, "Мінімальна довжина 8 символів")
      .max(256, "Максимальна довжина 256 символів")
      .required("Електронна адреса є обов'язковою"),
    password: Yup.string()
      .min(8, "Мінімальна довжина 8 символів")
      .max(64, "Максимальна довжина 64 символи")
      .required("Пароль є обов'язковим"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const data = await HttpClient.unauthorizedFetch(
          "http://localhost:8080/api/v1/auth/signin",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          }
        );

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        await fetchUserProfile(data.accessToken);
        navigate("/app");
      } catch (error) {
        setErrors({
          submit:
            "Невдала спроба логіну. Будь ласка, перевірте імейл та пароль.",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fetchUserProfile = async (accessToken) => {
    try {
      const data = await HttpClient.authorizedFetch(
        "http://localhost:8080/api/v1/auth/profile",
        {
          method: "GET",
        }
      );

      localStorage.setItem("user", JSON.stringify(data));
    } catch (error) {
      formik.setErrors({ submit: error.message });
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "url(/background.png)",
          backgroundSize: "cover",
          filter: "blur(6px)",
          zIndex: -1,
        }}
      />
      <div
        style={{
          maxWidth: "calc(100vw / 4)",
          margin: "auto",
          marginTop: "20vh",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          zIndex: 1,
        }}
      >
        <Typography
          variant="h5"
          style={{ marginBottom: "16px", marginLeft: "12px" }}
        >
          Логін
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <TextField
            label="Електронна адреса"
            type="email"
            variant="outlined"
            fullWidth
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            style={{ marginBottom: "16px" }}
          />
          <TextField
            label="Пароль"
            type="password"
            variant="outlined"
            fullWidth
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            style={{ marginBottom: "16px" }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            style={{ marginBottom: "16px", height: "50px", fontSize: "1rem" }}
            disabled={formik.isSubmitting}
          >
            Увійти
          </Button>
          {formik.errors.submit && (
            <Typography
              variant="body1"
              style={{ color: "red", marginTop: "16px" }}
            >
              {formik.errors.submit}
            </Typography>
          )}
        </form>
        <Typography
          variant="body1"
          style={{ textAlign: "center", marginTop: "16px" }}
        >
          Ще не зареєстровані?{" "}
          <Link href="/registration" underline="always">
            Реєстрація
          </Link>
        </Typography>
      </div>
    </div>
  );
};

export default LoginComponent;
