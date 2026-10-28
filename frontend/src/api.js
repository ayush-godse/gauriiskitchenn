const API_BASE_URL = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");

export const apiUrl = (path) => `${API_BASE_URL}${path}`;
