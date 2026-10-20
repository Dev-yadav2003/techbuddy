require("dotenv").config();

const required = ["DATABASE_URL", "JWT_PASSWORD"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(
    `Missing required env variable(s): ${missing.join(", ")}.\n` +
      "Copy .env.example to .env and fill in the values."
  );
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === "production";

// Comma-separated list of frontend URLs allowed to call this API.
const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

module.exports = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_PASSWORD,
  isProduction,
  corsOrigins,
};
