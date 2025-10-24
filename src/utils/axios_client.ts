import axios from "axios";
import { getAuthToken } from "./auth";

/**
 * @author Ankur Mundra on June, 2023
 */

const axiosClient = axios.create({
  baseURL: "http://localhost:3002",
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token && token !== "EXPIRED") {
    config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  }
  return Promise.reject("Authentication token not found! Please login again.");
});
export default axiosClient;
