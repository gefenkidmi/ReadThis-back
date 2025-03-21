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
const users_model_1 = __importDefault(require("../models/users_model"));
const test_uesrs_json_1 = __importDefault(require("./test_uesrs.json"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let app;
const baseUrl = "/auth";
let accessToken;
let refreshToken;
let userId;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, server_1.default)();
    console.log(process.env.DB_CONNECT);
    yield users_model_1.default.deleteMany();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));
describe("Auth Tests", () => {
    // Test Register new user - valid
    test("Successfully register a new user with an image", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post(`${baseUrl}/register`)
            .set("Content-Type", "multipart/form-data")
            .field("email", test_uesrs_json_1.default.validUsers.testUser1.email)
            .field("username", test_uesrs_json_1.default.validUsers.testUser1.username)
            .field("password", test_uesrs_json_1.default.validUsers.testUser1.password)
            .attach("image", fs_1.default.createReadStream(path_1.default.join(__dirname, test_uesrs_json_1.default.validUsers.testUser1.imageUrl)));
        // console.log("Register Response Body:", response.body); --> Debug
        expect(response.statusCode).toBe(200);
        expect(response.body.email).toBe(test_uesrs_json_1.default.validUsers.testUser1.email);
        expect(response.body.username).toBe(test_uesrs_json_1.default.validUsers.testUser1.username);
        expect(response.body.imageUrl).toBeDefined();
    }));
    // Test Register new user - invalid email
    test("Fail Register a new user with invalid email", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post(`${baseUrl}/register`)
            .set("Content-Type", "multipart/form-data")
            .field("email", test_uesrs_json_1.default.invalidUsers.invalidEmail.email)
            .field("username", test_uesrs_json_1.default.invalidUsers.invalidEmail.username)
            .field("password", test_uesrs_json_1.default.invalidUsers.invalidEmail.password)
            .attach("image", fs_1.default.createReadStream(path_1.default.join(__dirname, test_uesrs_json_1.default.invalidUsers.invalidEmail.imageUrl)));
        // console.log("Register Response Body:", response.body); --> Debug
        expect(response.statusCode).toBe(400);
    }));
    // Test Register new user - without image
    test("Fail Register a new user without image", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post(`${baseUrl}/register`)
            .set("Content-Type", "multipart/form-data")
            .field("email", test_uesrs_json_1.default.invalidUsers.noImage.email)
            .field("username", test_uesrs_json_1.default.invalidUsers.noImage.username)
            .field("password", test_uesrs_json_1.default.invalidUsers.noImage.password);
        // console.log("Register Response Body:", response.body); --> Debug
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toMatch(/Profile image is required/i);
    }));
    // Test Register new user - missing fields
    test("Fail Register new user without email", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post(`${baseUrl}/register`)
            .set("Content-Type", "multipart/form-data")
            .field("email", test_uesrs_json_1.default.invalidUsers.missingEmail.email)
            .field("username", test_uesrs_json_1.default.invalidUsers.missingEmail.username)
            .field("password", test_uesrs_json_1.default.invalidUsers.missingEmail.password)
            .attach("image", fs_1.default.createReadStream(path_1.default.join(__dirname, test_uesrs_json_1.default.invalidUsers.missingEmail.imageUrl)));
        // console.log("Register Response Body:", response.body); --> Debug
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toMatch(/All fields are required: email, username, password./i);
    }));
    test("Fail Register new user without username", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post(`${baseUrl}/register`)
            .set("Content-Type", "multipart/form-data")
            .field("email", test_uesrs_json_1.default.invalidUsers.missingUsername.email)
            .field("username", test_uesrs_json_1.default.invalidUsers.missingUsername.username)
            .field("password", test_uesrs_json_1.default.invalidUsers.missingUsername.password)
            .attach("image", fs_1.default.createReadStream(path_1.default.join(__dirname, test_uesrs_json_1.default.invalidUsers.missingUsername.imageUrl)));
        // console.log("Register Response Body:", response.body); --> Debug
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toMatch(/All fields are required: email, username, password./i);
    }));
    test("Fail Register new user without password", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post(`${baseUrl}/register`)
            .set("Content-Type", "multipart/form-data")
            .field("email", test_uesrs_json_1.default.invalidUsers.missingPassword.email)
            .field("username", test_uesrs_json_1.default.invalidUsers.missingPassword.username)
            .field("password", test_uesrs_json_1.default.invalidUsers.missingPassword.password)
            .attach("image", fs_1.default.createReadStream(path_1.default.join(__dirname, test_uesrs_json_1.default.invalidUsers.missingPassword.imageUrl)));
        // console.log("Register Response Body:", response.body); --> Debug
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toMatch(/All fields are required: email, username, password./i);
    }));
    // Test Register new user - existing email or username
    test("Fail Register a new user - with exsisting email or username", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post(`${baseUrl}/register`)
            .set("Content-Type", "multipart-form-data")
            .field("email", test_uesrs_json_1.default.validUsers.testUser1.email)
            .field("username", test_uesrs_json_1.default.validUsers.testUser1.username)
            .field("password", test_uesrs_json_1.default.validUsers.testUser1.password)
            .attach("image", fs_1.default.createReadStream(path_1.default.join(__dirname, test_uesrs_json_1.default.validUsers.testUser1.imageUrl)));
        // console.log("Register Response Body:", response.body); --> Debug
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toMatch(/Username or Email already exists. Please try a different one./i);
    }));
    //####################
    // Test Login user - valid
    test("Successful login with valid user", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post(`${baseUrl}/login`)
            .send(test_uesrs_json_1.default.loginCredentials.valid);
        // console.log("Login Response Body:", response.body); --> Debug
        expect(response.statusCode).toBe(200);
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
        expect(response.body._id).toBeDefined();
        accessToken = response.body.accessToken;
        refreshToken = response.body.refreshToken;
    }));
    // Test Login user - invalid
    test("Fail Login a user - with wrong password.", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post(`${baseUrl}/login`)
            .send(test_uesrs_json_1.default.loginCredentials.invalidPassword);
        // console.log("Login Response Body:", response.body); --> Debug
        expect(response.statusCode).toBe(401);
    }));
    // Test Login user - non exsists user
    test("Fail Login a user - non exsists user", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post(`${baseUrl}/login`)
            .send(test_uesrs_json_1.default.loginCredentials.invalidUsername);
        // console.log("Login Response Body:", response.body); --> Debug
        expect(response.statusCode).toBe(400);
    }));
    // ###################
    // Test Logout - valid refresh token
    test("Successfully Logout - Valid refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post(`${baseUrl}/logout`)
            .send({ refreshToken });
        // console.log("Logout Response Body:", response.body); --> Debug
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("Success");
    }));
    // Test Logout - missing refresh token
    test("Fail to logout with missing token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post(`${baseUrl}/logout`)
            .send({});
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("Refresh token is required");
    }));
    // Test Logout - invalid refresh token / nonexsists refresh token
    test("Logout with invalid/nonexistent refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post(`${baseUrl}/logout`)
            .send({ refreshToken: "invalidToken" });
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("Success");
    }));
    // ###################
    // get new refresh token by login again
    test("Successful login with valid user", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post(`${baseUrl}/login`)
            .send(test_uesrs_json_1.default.loginCredentials.valid);
        // console.log("Login Response Body:", response.body); --> Debug
        expect(response.statusCode).toBe(200);
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
        expect(response.body._id).toBeDefined();
        accessToken = response.body.accessToken;
        refreshToken = response.body.refreshToken;
        userId = response.body._id;
    }));
    // Test Refresh token - valid refresh token
    test("Successful Refresh Token - valid refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post(`${baseUrl}/refresh`)
            .send({ refreshToken });
        // console.log("Refresh Response Body:", response.body); --> Debug
        expect(response.statusCode).toBe(200);
    }));
    // Test Refresh token - invalid refresh token
    test("Fail Refresh Token - invalid refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post(`${baseUrl}/refresh`)
            .send({ refreshToken: test_uesrs_json_1.default.refreshTokens.invalid });
        // console.log("Refresh Response Body:", response.body); --> Debug
        expect(response.statusCode).toBe(401);
        expect(response.text).toBe("Invalid refresh token");
    }));
    // Test Refresh Token - missing refresh token
    test("Fail Refresh Token - Missing refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post(`${baseUrl}/refresh`)
            .send({});
        // console.log("Refresh Response Body:", response.body); 
        expect(response.statusCode).toBe(400);
    }));
    // Test Refresh Token - TOKEN_SECRET is missing
    test("Fail Refresh Token -  TOKEN_SECRET is missing", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalSecret = process.env.TOKEN_SECRET;
        delete process.env.TOKEN_SECRET;
        const response = yield (0, supertest_1.default)(app)
            .post(`${baseUrl}/refresh`)
            .send({ refreshToken });
        expect(response.statusCode).toBe(500);
        expect(response.text).toBe("Server Error");
        process.env.TOKEN_SECRET = originalSecret;
    }));
    //####################
    // Test get user by id - get profile
    test("Successful Get profile - with valid token", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .get(`${baseUrl}/me`)
            .set("Authorization", `JWT ${accessToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.username).toBe(test_uesrs_json_1.default.validUsers.testUser1.username);
        expect(res.body.email).toBe(test_uesrs_json_1.default.validUsers.testUser1.email);
        expect(res.body.password).toBeUndefined();
        expect(res.body.refreshToken).toBeUndefined();
    }));
    // Test get my profile - without token
    test("Fail Get profile - without token", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .get(`${baseUrl}/me`);
        expect(res.statusCode).toBe(401);
    }));
    // Test update profile - new username and password
    test("Successfuly Update profile  - with new username and image", () => __awaiter(void 0, void 0, void 0, function* () {
        const imagePath = path_1.default.join(__dirname, test_uesrs_json_1.default.profileUpdates.valid.imageUrl);
        const res = yield (0, supertest_1.default)(app)
            .put(`${baseUrl}/profile`)
            .set("Authorization", `JWT ${accessToken}`)
            .field("username", test_uesrs_json_1.default.profileUpdates.valid.username)
            .attach("image", imagePath);
        expect(res.statusCode).toBe(200);
        expect(res.body.username).toBe(test_uesrs_json_1.default.profileUpdates.valid.username);
        expect(res.body.imageUrl).toContain(`/uploads/profile/${userId}.png`);
    }));
    // Test Update profile without token
    test("Fail Update profile without token", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .put(`${baseUrl}/profile`)
            .field("username", test_uesrs_json_1.default.profileUpdates.valid.username);
        expect(res.statusCode).toBe(401);
    }));
    // Test update profile only with username 
    test("Successfully Update profile with only username", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .put(`${baseUrl}/profile`)
            .set("Authorization", `JWT ${accessToken}`)
            .field("username", test_uesrs_json_1.default.profileUpdates.valid.username);
        expect(res.statusCode).toBe(200);
        expect(res.body.username).toBe(test_uesrs_json_1.default.profileUpdates.valid.username);
    }));
});
//# sourceMappingURL=users.test.js.map