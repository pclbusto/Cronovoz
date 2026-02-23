// Utility to get the API URL dynamically based on the current host.
// This allows the app to work on any device in the LAN.
const API_BASE_URL = `http://${window.location.hostname}:8000`;

export default API_BASE_URL;
