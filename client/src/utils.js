export async function authorizedFetch(url, options = {}) {
  try {
    options.headers = options.headers || {};
    options.headers.Authorization = `Bearer ${localStorage.getItem(
      "accessToken"
    )}`;

    let response = await fetch(url, options);
    if (response.status === 401) {
      const tokenRefreshed = await refreshToken();

      if (tokenRefreshed) {
        options.headers.Authorization = `Bearer ${localStorage.getItem(
          "accessToken"
        )}`;

        response = await fetch(url, options);
      } else {
        throw new Error("Failed to refresh tokens");
      }
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

async function refreshToken() {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return false;
    }

    const response = await fetch(
      "http://localhost:8080/api/v1/auth/tokens/refresh",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const tokens = await response.json();
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);

    return true;
  } catch (error) {
    throw error;
  }
}