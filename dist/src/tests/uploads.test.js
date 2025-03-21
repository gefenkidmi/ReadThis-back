"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const upload_controller_1 = require("../controllers/upload_controller");
let app;
beforeAll(() => {
    app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.post("/upload", upload_controller_1.uploadImage);
});
afterAll(() => {
    fs_extra_1.default.emptyDirSync(path_1.default.join(__dirname, "../uploads"));
});
describe("Upload Image Middleware", () => {
    const imagePath = path_1.default.join(__dirname, "./sample.png");
    test("Successfull Uploads image with identifier and type", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .post("/upload")
            .field("identifier", "testuser")
            .field("type", "profile")
            .attach("image", imagePath);
        expect(res.statusCode).toBe(200);
        expect(res.body.imagePath).toBe("/uploads/profile/testuser.png");
        // Check if file actually exists
        const uploaded = path_1.default.join(__dirname, "./sample.png");
        expect(fs_extra_1.default.existsSync(uploaded)).toBe(true);
    }));
    test("Fails when no image is sent", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .post("/upload")
            .field("identifier", "testuser")
            .field("type", "profile");
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("No file uploaded!");
    }));
    test("Fails when no identifier is provided", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .post("/upload")
            .field("type", "profile")
            .attach("image", imagePath);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Identifier (username or postId) is required");
    }));
    test("Successfull Uploads to default type when type is missing", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .post("/upload")
            .field("identifier", "generaluser")
            .attach("image", imagePath);
        expect(res.statusCode).toBe(200);
        expect(res.body.imagePath).toBe("/uploads/general/generaluser.png");
        const uploaded = path_1.default.join(__dirname, "./sample.png");
        expect(fs_extra_1.default.existsSync(uploaded)).toBe(true);
    }));
});
//# sourceMappingURL=uploads.test.js.map