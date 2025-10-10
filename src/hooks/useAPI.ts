import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { useCallback, useState } from "react";
import { getAuthToken } from "../utils/auth";

/**
 * @author Ankur Mundra on April, 2023
 */

axios.defaults.baseURL = "http://localhost:3002";
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
      });
    setIsLoading(false);
  }, []);

  return { data, setData, isLoading, error, sendRequest };
};

export default useAPI;
