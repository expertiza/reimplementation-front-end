/**
 * Rails API origin. For production Docker/VCL, set VITE_API_BASE_URL at build time
 * (e.g. .env.production: VITE_API_BASE_URL=http://YOUR_VCL_IP:3002).
 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3003"
).replace(/\/$/, "");
