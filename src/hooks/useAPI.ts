import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { useCallback, useRef, useState } from "react";
import { getAuthToken } from "../utils/auth";
import { API_BASE_URL } from "../utils/apiBaseUrl";

/**
 * @author Ankur Mundra on April, 2023
 */

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.put["Content-Type"] = "application/json";
axios.defaults.headers.patch["Content-Type"] = "application/json";

export type UseAPIOptions = {
  /** Default true (show loading until first request finishes). Use false for action-only hooks (e.g. save) that idle until sendRequest. */
  initialLoading?: boolean;
};

const useAPI = (options?: UseAPIOptions) => {
  const initialLoading = options?.initialLoading ?? true;
  const [data, setData] = useState<AxiosResponse>();
  const [error, setError] = useState<string | null>("");
  const [errorStatus, setErrorStatus] = useState<string | null>('');
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading);
  /** Ignore axios callbacks from superseded requests (e.g. overlapping GETs). */
  const requestGenerationRef = useRef(0);

  // Learn about Axios Request Config at https://github.com/axios/axios#request-config
  const sendRequest = useCallback((requestConfig: AxiosRequestConfig & { transformRequest?: (data: any) => any }) => {
    const token = getAuthToken();
    if (token) {
      requestConfig.headers = {
        ...requestConfig.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // Apply transformRequest if provided
    if (requestConfig.transformRequest && requestConfig.data) {
      requestConfig.data = requestConfig.transformRequest(requestConfig.data);
      // Remove the transformRequest from config after using it
      delete requestConfig.transformRequest;
    }

    const generation = ++requestGenerationRef.current;
    setIsLoading(true);
    setError("");

    axios({
      ...requestConfig,
      timeout: requestConfig.timeout ?? 30_000,
    })
      .then((response) => {
        if (generation !== requestGenerationRef.current) return;
        setData(response);
      })
      .catch((err) => {
        if (generation !== requestGenerationRef.current) return;
        let errorMessage = "";

        if (err.response) {
          console.log(err.response)
          const errors = err.response.data;
          if (typeof errors === "string") {
            errorMessage = errors;
          } else if (errors && typeof errors === "object") {
            if (typeof (errors as { error?: unknown }).error === "string") {
              errorMessage = (errors as { error: string }).error;
            } else {
              const messages = Object.entries(errors).flatMap(([field, msgs]) => {
                if (Array.isArray(msgs)) return msgs.map((m) => `${field} ${m}`);
                return [`${field}: ${msgs}`];
              });
              errorMessage = messages.join(", ");
            }
          }
        } else if (err.request) {
          console.log("The request was made but no response was received", err);
          errorMessage = err.request.message || err.message || "Something went wrong!";
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", err.message);
          errorMessage = err.message || "Something went wrong!";
        }
        const status = err.response?.status;
        if (errorMessage) setError(errorMessage);
        if (status) setErrorStatus(status.toString())
      })
      .finally(() => {
        if (generation === requestGenerationRef.current) {
          setIsLoading(false);
        }
      });
  }, []);

  const reset = (error: boolean, data: boolean) => {
    if (error) {
      setError(null);
    }
    if (data) {
      setData(undefined);
    }
  };
  // console.log(errorStatus)

  return { data, setData, isLoading, error, sendRequest, reset, errorStatus };
};

export default useAPI;