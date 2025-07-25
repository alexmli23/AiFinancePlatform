import { getEnv } from "../utils/get-env"

const envConfig = () => ({
    NODE_ENV: getEnv("NODE_ENV", "development"),

    PORT: getEnv("PORT", "8000"),
    BASE_PATH: getEnv("BASE_PATH", "/api"),
    MONGO_URI: getEnv("MONGO_URI", ""),

    JWT_SECRET: getEnv("JWT_SECRET", "secret_jwt"),
    JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "15m") as string,

    JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET", "secret_jwt_refresh"),
    JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "7d") as string,

    GEMINI_API: getEnv("GEMINI_API_KEY"),
    FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "localhost"),

})

export const Env = envConfig()