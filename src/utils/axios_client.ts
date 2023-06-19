/**
 * @author Ankur Mundra on June, 2023
 */

import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:3002/api/v1",
    timeout: 1000,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
});
export default axiosClient;