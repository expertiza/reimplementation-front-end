import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { useCallback, useEffect, useState } from "react";
import { getAuthToken } from "../utils/auth";

/**
 * @author Ankur Mundra on April, 2023
 */

axios.defaults.baseURL = "http://localhost:3002";
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.put["Content-Type"] = "application/json";
axios.defaults.headers.patch["Content-Type"] = "application/json";

// Rails field keys arrive snake_case (e.g. "topic_identifier"); show them the way a
// user expects to read them: "Topic Identifier".
const humanizeField = (field: string): string =>
  field
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

// Rails error bodies take several shapes across controllers: a plain string, an
// array, a field => messages map (raw ActiveModel::Errors or wrapped in `message`/
// `errors`), or `{ error: ... }`. Unwrap the common envelope keys and otherwise
// walk the object so e.g. `{ message: { topic_identifier: ["has already been
// taken"] } }` renders as "Topic Identifier has already been taken" instead of
// "message: [object Object]".
const flattenErrorPayload = (payload: unknown): string => {
  if (payload == null) return "";
  if (typeof payload === "string") return payload;
  if (Array.isArray(payload)) return payload.map((item) => flattenErrorPayload(item)).join(", ");
  if (typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if ("message" in obj) return flattenErrorPayload(obj.message);
    if ("error" in obj) return flattenErrorPayload(obj.error);
    if ("errors" in obj) return flattenErrorPayload(obj.errors);
    return Object.entries(obj)
      .map(([field, value]) => `${humanizeField(field)} ${flattenErrorPayload(value)}`)
      .join(", ");
  }
  return String(payload);
};

const useAPI = () => {
  const [data, setData] = useState<AxiosResponse>();
  const [error, setError] = useState<string | null>("");
  const [errorStatus, setErrorStatus] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Learn about Axios Request Config at https://github.com/axios/axios#request-config
  const sendRequest = useCallback(
    async (requestConfig: AxiosRequestConfig & { transformRequest?: (data: any) => any }) => {
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

      setIsLoading(true);
      setError("");

      try {
        const response = await axios(requestConfig);
        setData(response);
        setErrorStatus(null);
        return response;
      } catch (err: any) {
        let errorMessage = "";

        if (err.response) {
          console.log(err.response);
          errorMessage = flattenErrorPayload(err.response.data);
          if (err.response.status) setErrorStatus(err.response.status.toString());
        } else if (err.request) {
          console.log("The request was made but no response was received", err);
          errorMessage = err.request.message || err.message || "Something went wrong!";
          setErrorStatus(null);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", err.message);
          errorMessage = err.message || "Something went wrong!";
          setErrorStatus(null);
        }

        if (errorMessage) setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

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
