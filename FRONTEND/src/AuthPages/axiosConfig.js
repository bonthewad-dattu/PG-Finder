// axiosConfig.js
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8080/api",
    withCredentials:true,
});

//75847584758475847584758475

export default axiosInstance;
