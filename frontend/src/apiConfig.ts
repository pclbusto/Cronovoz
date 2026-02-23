// frontend/src/apiConfig.ts

// 1. Leemos la variable de Vercel. Si no existe (entorno local), usamos tu IP.
let API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;

// 2. Parche clave: Como en el fetch ya agregás "/api/", le sacamos el "/api" 
// a la variable de Vercel si es que lo tiene al final, para que no se duplique.
if (API_BASE_URL.endsWith('/api')) {
    API_BASE_URL = API_BASE_URL.replace('/api', '');
}

// ... acá abajo sigue tu código normal del fetch ...


// Utility to get the API URL dynamically based on the current host.
// This allows the app to work on any device in the LAN.
// const API_BASE_URL = `http://${window.location.hostname}:8000`;

export default API_BASE_URL;
