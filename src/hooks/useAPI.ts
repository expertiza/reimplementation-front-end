import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { useCallback, useState } from "react";
import { getAuthToken } from "../utils/auth";

/**
 * @author Ankur Mundra on April, 2023
 */

axios.defaults.baseURL = "http://localhost:3002/api/v1";
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.put["Content-Type"] = "application/json";
axios.defaults.headers.patch["Content-Type"] = "application/json";

const useAPI = () => {
  const [data, setData] = useState<AxiosResponse>();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Learn about Axios Request Config at https://github.com/axios/axios#request-config
  const sendRequest = useCallback((requestConfig: AxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) {
      requestConfig.headers = {
        ...requestConfig.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    setIsLoading(true);
    setError("");

    // Development mock handlers: allow working without a backend
    if (process.env.NODE_ENV === "development" || process.env.REACT_APP_USE_MOCK === "true") {
      const url = (requestConfig.url || "").toString();
      const method = (requestConfig.method || "get").toString().toLowerCase();

      // Simple in-memory mock data
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

      const makeResponse = (data: any, status = 200) => {
        const resp: AxiosResponse = {
          data: data,
          status: status,
          statusText: status === 200 ? "OK" : "Created",
          headers: {},
          config: requestConfig,
        } as AxiosResponse;
        return resp;
      };

      // Simulate network latency
      setTimeout(() => {
        try {
          if (url === "/assignments" && method === "get") {
            setData(makeResponse(mockAssignments));
            setIsLoading(false);
            return;
          }

          // Match any assignment ID routes (GET /assignments/1, /assignments/1/edit, etc)
const assignmentIdMatch = url.match(/\/assignments\/(\d+)/);
if (assignmentIdMatch && method === "get") {
  const id = parseInt(assignmentIdMatch[1], 10);
  const found = mockAssignments.find((a) => a.id === id);
  if (found) {
    setData(makeResponse(found));
  } else {
    // Return a mock assignment with the requested ID
    setData(makeResponse({
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
    }));
  }
  setIsLoading(false);
  return;
}

          if (url === "/assignments" && (method === "post" || method === "put" || method === "patch")) {
            // create or update - echo back created assignment with id
            let payload: any = requestConfig.data || {};
            try {
              if (typeof payload === "string") payload = JSON.parse(payload);
            } catch (e) {
              // ignore
            }
            const created = { id: Math.floor(Math.random() * 10000) + 2, ...payload };
            setData(makeResponse(created, 201));
            setIsLoading(false);
            return;
          }

          if (url === "/courses" && method === "get") {
            setData(makeResponse(mockCourses));
            setIsLoading(false);
            return;
          }
          // Mock submission/review related endpoints
if (url.includes("/submissions") && method === "get") {
  setData(makeResponse([]));
  setIsLoading(false);
  return;
}

if (url.includes("/reviews") && method === "get") {
  setData(makeResponse([]));
  setIsLoading(false);
  return;
}

if (url.includes("/teams") && method === "get") {
  setData(makeResponse([]));
  setIsLoading(false);
  return;
}

if (url.includes("/participants") && method === "get") {
  setData(makeResponse([]));
  setIsLoading(false);
  return;
}

          // Mock user/profile endpoint
          if (url.includes("/users") && method === "get") {
            const mockUser = {
              id: 6,
              name: "Instructor Six",
              full_name: "Instructor Six",
              email: "instructor6@example.com",
              role: "Instructor"
            };
            setData(makeResponse(mockUser));
            setIsLoading(false);
            return;
          }

          // Mock any other GET requests with empty array
          if (method === "get") {
            setData(makeResponse([]));
            setIsLoading(false);
            return;
          }

          // Mock any POST/PUT/PATCH with success response
          if (method === "post" || method === "put" || method === "patch") {
            setData(makeResponse({ success: true, message: "Operation successful" }, 201));
            setIsLoading(false);
            return;
          }

          // Mock DELETE
          if (method === "delete") {
            setData(makeResponse({ success: true, message: "Deleted successfully" }));
            setIsLoading(false);
            return;
          }

        } catch (err) {
          setError((err as Error).message || "Mock error");
          setIsLoading(false);
        }
      }, 200);
      
      // IMPORTANT: Return early to prevent real axios call
      return;
    }

    let errorMessage = "";

    axios(requestConfig)
      .then((response) => setData(response))
      .catch((err) => {
        if (err.response) {
          const errors = err.response.data;
          const messages = Object.entries(errors).flatMap(([field, messages]) => {
            if (Array.isArray(messages)) return messages.map((m) => `${field} ${m}`);
            return `${field} ${messages}`;
          });
          errorMessage = messages.join(", ");
        } else if (err.request) {
          console.log("The request was made but no response was received", err);
          errorMessage = err.request.message || err.message || "Something went wrong!";
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", err.message);
          errorMessage = err.message || "Something went wrong!";
        }

        if (errorMessage) setError(errorMessage);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { data, setData, isLoading, error, sendRequest };
};

export default useAPI;