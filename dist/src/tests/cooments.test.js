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
const server_1 = __importDefault(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
const comments_model_1 = __importDefault(require("../models/comments_model"));
const test_comments_json_1 = __importDefault(require("./test_comments.json"));
var app;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("beforeAll");
    app = yield (0, server_1.default)();
    yield comments_model_1.default.deleteMany();
}));
afterAll((done) => {
    console.log("afterAll");
    mongoose_1.default.connection.close();
    done();
});
let commentId = "";
describe("Comments Tests", () => {
    test("Comments test get all", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comments");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0);
    }));
    test("Test Create Comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/comments").send(test_comments_json_1.default[0]);
        expect(response.statusCode).toBe(201);
        expect(response.body.comment).toBe(test_comments_json_1.default[0].comment);
        expect(response.body.postId).toBe(test_comments_json_1.default[0].postId);
        expect(response.body.owner).toBe(test_comments_json_1.default[0].owner);
        commentId = response.body._id;
    }));
    test("Test get commenty by owner", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comments?owner=" + test_comments_json_1.default[0].owner);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].comment).toBe(test_comments_json_1.default[0].comment);
        expect(response.body[0].postId).toBe(test_comments_json_1.default[0].postId);
        expect(response.body[0].owner).toBe(test_comments_json_1.default[0].owner);
    }));
    test("Comments get post by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comments/" + commentId);
        expect(response.statusCode).toBe(200);
        expect(response.body.comment).toBe(test_comments_json_1.default[0].comment);
        expect(response.body.postId).toBe(test_comments_json_1.default[0].postId);
        expect(response.body.owner).toBe(test_comments_json_1.default[0].owner);
    }));
});
//# sourceMappingURL=cooments.test.js.map