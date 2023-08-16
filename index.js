import express from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import "express-async-errors";
import morgan from "morgan";
import cors from "cors";
import http from "http";
import https from "https";
import fileUpload from "express-fileupload";
import fs from "fs";

import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import connectDB from "./db/connect.js";

// routers
import authRouter from "./routes/authRoutes.js";
import blogRouter from "./routes/blogsRoutes.js";
import contactRouter from "./routes/contactRoutes.js";
import writerRouter from "./routes/writterRoutes.js";
import commentRouter from "./routes/commentRoutes.js";
import googleLogin from "./routes/GoogleRoute.js";
import RecentActivities from "./routes/recentActivitiesRoutes.js";
import Stories from "./routes/storiesRoutes.js";
// import imageRouter from "./routes/uploadImageRoute.js"

// middleware
import notFoundMiddleware from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(xss());
app.use(mongoSanitize());
app.use(express.static("public"));

// "http://127.0.0.1:5173"  is the localhost of React+Vite App we are allowing this by now to use our APIS
app.use(
  cors({
    credentials: true,
    origin: [
      "https://howsquare-sultan.netlify.app",
      "https://howsquare.netlify.app",
      "http://68.183.244.167:3000",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
  })
);

app.get("/", (req, res) => {
  res.json({ message: "how square is running" });
});
// There is one more middleware we need to build to check for the approvedWritters
app.use("/api/v1/auth", authRouter);
app.use("/api/v1", googleLogin);
app.use("/api/v1/blog", blogRouter);
app.use("/api/v1/writer", writerRouter);
app.use("/api/v1/contact", contactRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/recent", RecentActivities);
app.use("/api/v1/stories", Stories);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const httpServer = http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
  res.end();
});
const httpsOptions = {
  cert: fs.readFileSync("./security/prod/certificate.crt"),
  key: fs.readFileSync("./security/prod/howsquare.key"),
  ca: fs.readFileSync("./security/prod/ca_bundle.crt"),
};
const httpsServer = https.createServer(httpsOptions, app);

const start = async () => {
  try {
    connectDB(process.env.MONGO_URL);
    httpServer.listen(80, () => {
      console.log("HTTP server listening on port 80");
    });

    httpsServer.listen(443, () => {
      console.log("HTTPS server listening on port 443");
    });
  } catch (error) {
    console.log(error);
  }
};
start();
