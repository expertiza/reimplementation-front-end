import axios from "axios";
import { getAuthToken } from "./auth";
import { API_BASE_URL } from "./apiBaseUrl";

/**
 * @author Ankur Mundra on June, 2023
 */

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Increased from 1000ms to 10 seconds
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token && token !== "EXPIRED") {
    config.headers["Authorization"] = `Bearer ${token}`;
  } else {
    return Promise.reject("Authentication token not found! Please login again.");
  }
  // Default Content-Type is application/json; for FormData the browser must set
  // multipart/form-data with a boundary or Rails receives params, not UploadedFile.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    const h = config.headers;
    if (h && typeof (h as { delete?: (k: string) => void }).delete === "function") {
      (h as { delete: (k: string) => void }).delete("Content-Type");
    } else if (h && typeof h === "object") {
      delete (h as Record<string, unknown>)["Content-Type"];
    }
  }
  return config;
});

// Add response interceptor for debugging
axiosClient.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.status, error.response?.data, error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
