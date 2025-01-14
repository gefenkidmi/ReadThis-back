import dotenv from "dotenv";
dotenv.config();

import express, { Express } from "express";
import cors from "cors";
import mongoose from "mongoose";
// import bodyParser from "body-parser"; // Optional, can use express.json() instead.
import swaggerJsDoc from "swagger-jsdoc";
import path from "path";

import swaggerUI from "swagger-ui-express";
import cors from "cors";

// Routes
import postsRoute from "./routes/post_route";
import commentsRoute from "./routes/comments_route";
import authRoutes from "./routes/users_route"; // or "auth_route"

// Initialize app
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Allow frontend requests
    credentials: true, // Allow cookies and authentication headers if needed
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/posts", postsRoute);
app.use("/comments", commentsRoute);
app.use("/auth", authRoutes);

// 4) Connect to MongoDB
const db = mongoose.connection;
db.on("error", (error) => console.error("MongoDB Connection Error:", error));
db.once("open", () => console.log("Connected to MongoDB"));

const initApp = (): Promise<Express> => {
  return new Promise((resolve, reject) => {
    if (!process.env.DB_CONNECT) {
      reject("DB_CONNECT is not defined in .env file");
      return;
    }
    mongoose
      .connect(process.env.DB_CONNECT)
      .then(() => {
        console.log("MongoDB connected.");
        resolve(app);
      })
      .catch((error) => reject(error));
  });
};

// 5) Swagger setup (optional, for API docs)
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Web Dev 2025 - D - REST API",
      version: "1.0.0",
      description: "REST server including authentication using JWT",
    },
    servers: [{ url: "http://localhost:" + process.env.PORT }],
  },
  apis: ["./src/routes/*.ts"], // or wherever your routes with swagger comments are
};
const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

export default initApp;
