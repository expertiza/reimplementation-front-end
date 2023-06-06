import axios, { AxiosRequestConfig } from "axios";
import { useCallback, useState } from "react";

/**
 * @author Ankur Mundra on April, 2023
 */

axios.defaults.baseURL = "http://localhost:3000/api/v1";
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.put["Content-Type"] = "application/json";
axios.defaults.headers.patch["Content-Type"] = "application/json";

const useAPI = () => {
  const [data, setData] = useState<Array<any>>([]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Learn about Axios Request Config at https://github.com/axios/axios#request-config
  const sendRequest = useCallback((requestConfig: AxiosRequestConfig) => {
    setIsLoading(true);
    setError("");

    axios(requestConfig)
      .then((response) => {
        // if response is from delete request, response.data is null
        if (response.config && response.config.method === "delete") setData([response.status]);
        else setData(Array.isArray(response.data) ? response.data : [response.data]);
      })
      .catch((err) => {
        if (err.response) {
          const errors = err.response.data;
          console.log(errors);

          const messages = Object.entries(errors).map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return messages.map((m) => `${field} ${m}`);
            }
            return `${field} ${messages}`;
          });
          throw new Error(messages.join(", "));
        } else if (err.request) {
          // The request was made but no response was received
          console.log(err.request);
          setError(err.request.message);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", err.message);
          setError(err.message || "Something went wrong!");
        }
      });
    setIsLoading(false);
  }, []);

  return { data, setData, isLoading, error, sendRequest };
};

export default useAPI;
