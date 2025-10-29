import axios from "axios";
import { getAuthToken } from "./auth";

/**
 * @author Ankur Mundra on June, 2023
 */

const axiosClient = axios.create({
  baseURL: "http://localhost:3002/api/v1",
  timeout: 10000, // Increased timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add mock interceptor BEFORE the auth interceptor
axiosClient.interceptors.request.use((config) => {
  console.log("axiosClient request:", config.method?.toUpperCase(), config.url);
  
  // Mock all requests - return mock data instead of making real calls
  const url = config.url || "";
  const method = (config.method || "get").toLowerCase();

  // Mock data
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

  // Intercept and return mock data
  const assignmentIdMatch = url.match(/\/assignments\/(\d+)/);
  if (assignmentIdMatch && method === "get") {
    const id = parseInt(assignmentIdMatch[1], 10);
    const found = mockAssignments.find((a) => a.id === id);
    const mockData = found || {
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
    
    console.log("Mock: Returning assignment", mockData);
    // Return a fake adapter that resolves with mock data
    config.adapter = () => {
      return Promise.resolve({
        data: mockData,
        status: 200,
        statusText: "OK",
        headers: {},
        config: config,
      });
    };
    return config;
  }

  if (url === "/assignments" && method === "get") {
    console.log("Mock: Returning assignments list");
    config.adapter = () => {
      return Promise.resolve({
        data: mockAssignments,
        status: 200,
        statusText: "OK",
        headers: {},
        config: config,
      });
    };
    return config;
  }

  if (url === "/courses" && method === "get") {
    console.log("Mock: Returning courses");
    config.adapter = () => {
      return Promise.resolve({
        data: mockCourses,
        status: 200,
        statusText: "OK",
        headers: {},
        config: config,
      });
    };
    return config;
  }

  // Mock any URL containing these keywords
  if (url.includes("/submissions") || url.includes("/reviews") || 
      url.includes("/teams") || url.includes("/participants")) {
    console.log("Mock: Returning empty array for", url);
    config.adapter = () => {
      return Promise.resolve({
        data: [],
        status: 200,
        statusText: "OK",
        headers: {},
        config: config,
      });
    };
    return config;
  }

  if (url.includes("/users") && method === "get") {
    console.log("Mock: Returning user");
    config.adapter = () => {
      return Promise.resolve({
        data: {
          id: 6,
          name: "Instructor Six",
          full_name: "Instructor Six",
          email: "instructor6@example.com",
          role: "Instructor"
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: config,
      });
    };
    return config;
  }

  // Mock all POST/PUT/PATCH/DELETE
  if (method === "post" || method === "put" || method === "patch") {
    console.log("Mock: Operation successful");
    config.adapter = () => {
      return Promise.resolve({
        data: { success: true, message: "Operation successful" },
        status: 201,
        statusText: "Created",
        headers: {},
        config: config,
      });
    };
    return config;
  }

  if (method === "delete") {
    console.log("Mock: Delete successful");
    config.adapter = () => {
      return Promise.resolve({
        data: { success: true, message: "Deleted successfully" },
        status: 200,
        statusText: "OK",
        headers: {},
        config: config,
      });
    };
    return config;
  }

  // Default: return empty array for any other GET
  if (method === "get") {
    console.log("Mock: Returning empty array for unmatched GET", url);
    config.adapter = () => {
      return Promise.resolve({
        data: [],
        status: 200,
        statusText: "OK",
        headers: {},
        config: config,
      });
    };
    return config;
  }

  return config;
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