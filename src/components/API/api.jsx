import axios from "axios";

const baseURL = "https://path-backend.onrender.com"; // Updated to use Render backend

//"http://localhost:5000"
// https://path-backend.onrender.com

export default axios.create({
  baseURL,
});
