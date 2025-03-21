import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import userModel, { IUser } from "../models/users_model";
import tests from "./test_uesrs.json";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { exec } from "child_process";
import exp from "constants";

let app: Express;
const baseUrl = "/auth";

let accessToken: string;
let refreshToken: string;
let userId: string;

beforeAll(async () => {
  app = await initApp();
  console.log(process.env.DB_CONNECT);
  await userModel.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Auth Tests", () => {
  // Test Register new user - valid
  test("Successfully register a new user with an image", async () => {
    const response = await request(app)
      .post(`${baseUrl}/register`)
      .set("Content-Type", "multipart/form-data")
      .field("email", tests.validUsers.testUser1.email)
      .field("username", tests.validUsers.testUser1.username)
      .field("password", tests.validUsers.testUser1.password)
      .attach("image", fs.createReadStream(path.join(__dirname, tests.validUsers.testUser1.imageUrl)));

    // console.log("Register Response Body:", response.body); --> Debug
    expect(response.statusCode).toBe(200);
    expect(response.body.email).toBe(tests.validUsers.testUser1.email);
    expect(response.body.username).toBe(tests.validUsers.testUser1.username);
    expect(response.body.imageUrl).toBeDefined();
  });


  // Test Register new user - invalid email
  test("Fail Register a new user with invalid email", async () => {
    const response = await request(app)
      .post(`${baseUrl}/register`)
      .set("Content-Type", "multipart/form-data")
      .field("email", tests.invalidUsers.invalidEmail.email)
      .field("username", tests.invalidUsers.invalidEmail.username)
      .field("password", tests.invalidUsers.invalidEmail.password)
      .attach("image", fs.createReadStream(path.join(__dirname, tests.invalidUsers.invalidEmail.imageUrl)));

    // console.log("Register Response Body:", response.body); --> Debug
    expect(response.statusCode).toBe(400);
  });

  // Test Register new user - without image
  test("Fail Register a new user without image", async () => {
    const response = await request(app)
      .post(`${baseUrl}/register`)
      .set("Content-Type", "multipart/form-data")
      .field("email", tests.invalidUsers.noImage.email)
      .field("username", tests.invalidUsers.noImage.username)
      .field("password", tests.invalidUsers.noImage.password)

    // console.log("Register Response Body:", response.body); --> Debug
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch(/Profile image is required/i);
  });

  // Test Register new user - missing fields
  test("Fail Register new user without email", async () => {
    const response = await request(app)
      .post(`${baseUrl}/register`)
      .set("Content-Type", "multipart/form-data")
      .field("email", tests.invalidUsers.missingEmail.email)
      .field("username", tests.invalidUsers.missingEmail.username)
      .field("password", tests.invalidUsers.missingEmail.password)
      .attach("image", fs.createReadStream(path.join(__dirname, tests.invalidUsers.missingEmail.imageUrl)));

      // console.log("Register Response Body:", response.body); --> Debug
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toMatch(/All fields are required: email, username, password./i);
  });

  test("Fail Register new user without username", async () => {
    const response = await request(app)
      .post(`${baseUrl}/register`)
      .set("Content-Type", "multipart/form-data")
      .field("email", tests.invalidUsers.missingUsername.email)
      .field("username", tests.invalidUsers.missingUsername.username)
      .field("password", tests.invalidUsers.missingUsername.password)
      .attach("image", fs.createReadStream(path.join(__dirname, tests.invalidUsers.missingUsername.imageUrl)));

      // console.log("Register Response Body:", response.body); --> Debug
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toMatch(/All fields are required: email, username, password./i);
  });

  test("Fail Register new user without password", async () => {
    const response = await request(app)
      .post(`${baseUrl}/register`)
      .set("Content-Type", "multipart/form-data")
      .field("email", tests.invalidUsers.missingPassword.email)
      .field("username", tests.invalidUsers.missingPassword.username)
      .field("password", tests.invalidUsers.missingPassword.password)
      .attach("image", fs.createReadStream(path.join(__dirname, tests.invalidUsers.missingPassword.imageUrl)));

      // console.log("Register Response Body:", response.body); --> Debug
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toMatch(/All fields are required: email, username, password./i);
  });

  // Test Register new user - existing email or username
  test("Fail Register a new user - with exsisting email or username", async () => {
    const response = await request(app)
      .post(`${baseUrl}/register`)
      .set("Content-Type", "multipart-form-data")
      .field("email", tests.validUsers.testUser1.email)
      .field("username", tests.validUsers.testUser1.username)
      .field("password", tests.validUsers.testUser1.password)
      .attach("image", fs.createReadStream(path.join(__dirname, tests.validUsers.testUser1.imageUrl)));

    // console.log("Register Response Body:", response.body); --> Debug
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch(/Username or Email already exists. Please try a different one./i);
  });

  //####################
  // Test Login user - valid
  test("Successful login with valid user", async () => {
    const response = await request(app)
      .post(`${baseUrl}/login`)
      .send(tests.loginCredentials.valid);

    // console.log("Login Response Body:", response.body); --> Debug
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body._id).toBeDefined();

    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  // Test Login user - invalid
  test("Fail Login a user - with wrong password.", async () => {
    const response = await request(app)
      .post(`${baseUrl}/login`)
      .send(tests.loginCredentials.invalidPassword);

      // console.log("Login Response Body:", response.body); --> Debug
      expect(response.statusCode).toBe(401);
  });

  // Test Login user - non exsists user
  test("Fail Login a user - non exsists user", async () => {
    const response = await request(app)
      .post(`${baseUrl}/login`)
      .send(tests.loginCredentials.invalidUsername);

    // console.log("Login Response Body:", response.body); --> Debug
    expect(response.statusCode).toBe(400);
  });

  // ###################
  // Test Logout - valid refresh token
  test("Successfully Logout - Valid refresh token", async () => {
    const response = await request(app)
      .post(`${baseUrl}/logout`)
      .send({refreshToken});

    // console.log("Logout Response Body:", response.body); --> Debug
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("Success");
  });

  // Test Logout - missing refresh token
  test("Fail to logout with missing token", async () => {
    const response = await request(app)
    .post(`${baseUrl}/logout`)
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Refresh token is required");
  });

  // Test Logout - invalid refresh token / nonexsists refresh token
  test("Logout with invalid/nonexistent refresh token", async () => {
    const response = await request(app)
      .post(`${baseUrl}/logout`)
      .send({ refreshToken: "invalidToken" });

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("Success"); 
  });

  // ###################
  // get new refresh token by login again
  test("Successful login with valid user", async () => {
    const response = await request(app)
      .post(`${baseUrl}/login`)
      .send(tests.loginCredentials.valid);

    // console.log("Login Response Body:", response.body); --> Debug
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body._id).toBeDefined();

    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
    userId = response.body._id;
  });

  // Test Refresh token - valid refresh token
  test("Successful Refresh Token - valid refresh token", async () => {
    const response = await request(app)
      .post(`${baseUrl}/refresh`)
      .send({refreshToken});
    
    // console.log("Refresh Response Body:", response.body); --> Debug
    expect(response.statusCode).toBe(200);
  });

  // Test Refresh token - invalid refresh token
  test("Fail Refresh Token - invalid refresh token", async () => {
    const response = await request(app)
      .post(`${baseUrl}/refresh`)
      .send({refreshToken:tests.refreshTokens.invalid});
    
    // console.log("Refresh Response Body:", response.body); --> Debug
    expect(response.statusCode).toBe(401)
    expect(response.text).toBe("Invalid refresh token");
  });

  // Test Refresh Token - missing refresh token
  test("Fail Refresh Token - Missing refresh token", async () => {
    const response = await request(app)
      .post(`${baseUrl}/refresh`)
      .send({});

    // console.log("Refresh Response Body:", response.body); 
    expect(response.statusCode).toBe(400);
  });

  // Test Refresh Token - TOKEN_SECRET is missing
  test("Fail Refresh Token -  TOKEN_SECRET is missing", async () => {
    const originalSecret = process.env.TOKEN_SECRET;
    delete process.env.TOKEN_SECRET;

    const response = await request(app)
      .post(`${baseUrl}/refresh`)
      .send({ refreshToken });

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe("Server Error");

    process.env.TOKEN_SECRET = originalSecret;
  });


  //####################
  // Test get user by id - get profile
  test("Successful Get profile - with valid token", async () => {
    const res = await request(app)
      .get(`${baseUrl}/me`)
      .set("Authorization", `JWT ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe(tests.validUsers.testUser1.username);
    expect(res.body.email).toBe(tests.validUsers.testUser1.email);
    expect(res.body.password).toBeUndefined();
    expect(res.body.refreshToken).toBeUndefined();
  });

  // Test get my profile - without token
  test("Fail Get profile - without token", async () => {
    const res = await request(app)
      .get(`${baseUrl}/me`);
    
      expect(res.statusCode).toBe(401);
  });

  // Test update profile - new username and password
  test("Successfuly Update profile  - with new username and image", async () => {
    const imagePath = path.join(__dirname, tests.profileUpdates.valid.imageUrl); 

    const res = await request(app)
      .put(`${baseUrl}/profile`)
      .set("Authorization", `JWT ${accessToken}`)
      .field("username", tests.profileUpdates.valid.username)
      .attach("image", imagePath);

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe(tests.profileUpdates.valid.username);
    expect(res.body.imageUrl).toContain(`/uploads/profile/${userId}.png`);
  });

  // Test Update profile without token
  test("Fail Update profile without token", async () => {
    const res = await request(app)
      .put(`${baseUrl}/profile`)
      .field("username", tests.profileUpdates.valid.username);
    expect(res.statusCode).toBe(401);
  });

  // Test update profile only with username 
  test("Successfully Update profile with only username", async () => {
    const res = await request(app)
      .put(`${baseUrl}/profile`)
      .set("Authorization", `JWT ${accessToken}`)
      .field("username", tests.profileUpdates.valid.username);

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe(tests.profileUpdates.valid.username);
  });
});