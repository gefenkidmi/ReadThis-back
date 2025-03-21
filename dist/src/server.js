"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
if (process.env.NODE_ENV === "test") {
    dotenv_1.default.config({ path: ".env.test" });
}
else if (process.env.NODE_ENV === "prod") {
    dotenv_1.default.config({ path: ".env.prod" });
}
else {
    dotenv_1.default.config();
}
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
// Routes
const post_route_1 = __importDefault(require("./routes/post_route"));
const comments_route_1 = __importDefault(require("./routes/comments_route"));
const users_route_1 = __importDefault(require("./routes/users_route"));
const books_route_1 = __importDefault(require("./routes/books_route"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const path_1 = __importDefault(require("path"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const cors_1 = __importDefault(require("cors"));
// Initialize app
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // Allow frontend requests
    credentials: true, // Allow cookies and authentication headers if needed
}));
// 2) Parse incoming JSON
app.use(express_1.default.json());
// 3) Define routes
app.use((0, cors_1.default)());
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // Allow requests from your frontend
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
}));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
app.use("/posts", post_route_1.default);
app.use("/comments", comments_route_1.default);
app.use("/auth", users_route_1.default);
app.use("/books", books_route_1.default);
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "/uploads")));
// 4) Connect to MongoDB
const db = mongoose_1.default.connection;
db.on("error", (error) => console.error("MongoDB Connection Error:", error));
db.once("open", () => console.log("Connected to MongoDB"));
const initApp = () => {
    return new Promise((resolve, reject) => {
        if (!process.env.DB_CONNECT) {
            reject("DB_CONNECT is not defined in .env file");
            return;
        }
        mongoose_1.default
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
const specs = (0, swagger_jsdoc_1.default)(options);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
exports.default = initApp;
//# sourceMappingURL=server.js.map