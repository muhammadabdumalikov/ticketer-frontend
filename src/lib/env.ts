const RAW = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export const API_BASE_URL = RAW;

// Socket.IO accepts http(s):// URLs and upgrades to ws(s):// internally.
export const WS_BASE_URL = RAW;
