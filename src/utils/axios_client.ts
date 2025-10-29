import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { getAuthToken } from "./auth";

/**
 * @author Ankur Mundra on June, 2023
 */

// Create mock adapter
const mockAdapter = (config: AxiosRequestConfig): Promise<any> => {
  const url = config.url || "";
  const method = (config.method || "get").toLowerCase();

  console.log("Mock adapter:", method.toUpperCase(), url);

  const mockAssignments = [
    {
      id: 1,
      name: "Mock Assignment",
      directory_path: "mock/path",
      spec_location: "",
      private: false,
      show_template_review: false,
      require_quiz: false,
      has_badge: false,
      staggered_deadline: false,
      is_calibrated: false,
      course_id: 1,
    },
  ];

  const mockCourses = [{ id: 1, name: "Mock Course" }];

  return new Promise((resolve) => {
    setTimeout(() => {
      let responseData: any = [];

      // Match assignment by ID
      const assignmentIdMatch = url.match(/\/assignments\/(\d+)/);
      if (assignmentIdMatch && method === "get") {
        const id = parseInt(assignmentIdMatch[1], 10);
        const found = mockAssignments.find((a) => a.id === id);
        responseData = found || {
          id: id,
          name: `Mock Assignment ${id}`,
          directory_path: "mock/path",
          spec_location: "",
          private: false,
          show_template_review: false,
          require_quiz: false,
          has_badge: false,
          staggered_deadline: false,
          is_calibrated: false,
          course_id: 1,
        };
      } else if (url.includes("/assignments") && method === "get") {
        responseData = mockAssignments;
      } else if (url.includes("/assignments") && (method === "post" || method === "put" || method === "patch")) {
        responseData = { id: Math.floor(Math.random() * 10000) + 2, ...config.data };
      } else if (url.includes("/courses") && method === "get") {
        responseData = mockCourses;
      } else if (url.includes("/submissions") || url.includes("/reviews") || 
                 url.includes("/teams") || url.includes("/participants")) {
        responseData = [];
      } else if (url.includes("/users") && method === "get") {
        responseData = {
          id: 6,
          name: "Instructor Six",
          full_name: "Instructor Six",
          email: "instructor6@example.com",
          role: "Instructor"
        };
      } else if (method === "delete") {
        responseData = { success: true, message: "Deleted successfully" };
      } else if (method === "post" || method === "put" || method === "patch") {
        responseData = { success: true, message: "Operation successful" };
      } else if (method === "get") {
        responseData = [];
      }

      console.log("Mock response:", responseData);

      resolve({
        data: responseData,
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        config: config,
        request: {}
      });
    }, 100);
  });
};

const axiosClient = axios.create({
  baseURL: "http://localhost:3002/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  adapter: mockAdapter as any, // Use mock adapter instead of real HTTP
});

axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAuthToken();
  if (token && token !== "EXPIRED") {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;