import { Express } from "express";
import supertest from "supertest";
import defaults from "superagent-defaults";
import initApp from "../server";
import mongoose from "mongoose";
import User, { IUser } from "../models/users_model";
import Post, { IPost } from "../models/post_model";
import fs from "fs";
import path from "path";

let app: Express;

const post: IPost = {
  title: "this is a title",
  content: "this is a post",
  owner: "",
  usersWhoLiked: [],
  imageUrl: "",
};

let newPost = { content: "new content" };

const postWithPrompt = {
  imageUrl: "",
  owner: "owner",
  content: "image prompt post",
  image_prompt: "image prompt",
  createdBy: "",
  usersWhoLiked: [],
};

const comment1 = { text: "hi" };

let accessToken = "";
let request;
let userId;
let postId;

beforeAll(async () => {
  app = await initApp();
  request = defaults(supertest(app));
  await Post.deleteMany({});
  const response = await request
    .post("/auth/register")
    .set("Content-Type", "multipart/form-data")
    .field("email", "post-test@student.post.test")
    .field("username", "test")
    .field("password", "1235678")
    .attach("image", fs.createReadStream(path.join(__dirname, "./sample.png")));
  userId = response.body._id;
  const signInResponse = await request.post("/auth/login").send({
    username: "test",
    password: "1235678",
  });
  accessToken = signInResponse.body.accessToken; // ✅ Get token from sign-in
  request.set({ Authorization: `Bearer ${accessToken}` }); // ✅ Use the new token
  userId = response.body._id;
});

afterAll(async () => {
  await User.findByIdAndDelete(userId);
  await mongoose.connection.close();
});

describe("Post get tests", () => {
  test("Test Get All Posts - empty list", async () => {
    const response = await request.get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(0);
  });

  test("Test Get Posts by user id - empty list", async () => {
    const response = await request.get(`/posts/my-posts`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(0);
  });
});

describe("Post post tests", () => {
  test("should create a post", async () => {
    const response = await request
      .post("/posts")
      .field("owner", userId)
      .field("title", "title")
      .field("content", "content")
      .attach(
        "image",
        fs.createReadStream(path.join(__dirname, "./sample.png"))
      );
    expect(response.statusCode).toBe(201);
    postId = response.body.post._id;
    expect(response.body.post.content).toEqual("content");
    expect(response.body.post.owner).toEqual(userId);
  });

  test("Test Get a post", async () => {
    const response = await request.get("/posts/" + postId);
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toEqual("content");
  });

  test("Test Get all posts", async () => {
    const response = await request.get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
  });
});

describe("Post get tests", () => {
  test("Test Get Posts by user id - one post", async () => {
    const response = await request.get(`/posts/my-posts`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].content).toEqual("content");
  });
});

describe("Put post tests", () => {
  test("Test Put a post", async () => {
    const response = await request.put(`/posts/` + postId).send(newPost);
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toEqual("new content");
  });

  test("Test Get a post", async () => {
    const response = await request.get("/posts/" + postId);
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toEqual("new content");
  });
});

describe("Add a comment to post tests", () => {
  test("Test no comments on post", async () => {
    const response = await request.get("/posts/" + postId);
    expect(response.statusCode).toBe(200);
    expect(response.body.comments).toHaveLength(0);
  });

  test("Test comment on a post", async () => {
    const response = await request
      .post(`/posts/comment/` + postId)
      .send(comment1);
    expect(response.statusCode).toBe(201);
    const postResponse = await request.get("/posts/" + postId);
    expect(postResponse.statusCode).toBe(200);
    expect(postResponse.body.comments).toHaveLength(1);
  });

  test("Test one comment on post", async () => {
    const response = await request.get("/posts/" + postId);
    expect(response.statusCode).toBe(200);
    expect(response.body.comments).toHaveLength(1);
    expect(response.body.comments[0].text).toEqual(comment1.text);
    expect(response.body.comments[0].user._id).toEqual(userId);
  });
});

describe("Like a post tests", () => {
  test("Test no likes on post", async () => {
    const response = await request.get("/posts/" + postId);
    expect(response.statusCode).toBe(200);
    expect(response.body.usersWhoLiked).toHaveLength(0);
  });

  test("Test unlike an unliked post- error", async () => {
    const response = await request.post(`/posts/unlike/` + postId);
    expect(response.statusCode).toBe(406);
  });

  test("Test like an unliked post", async () => {
    const response = await request.post(`/posts/like/${postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.usersWhoLiked).toHaveLength(1);
  });

  test("Test number of likes on post should equal 1", async () => {
    const response = await request.get(`/posts/${postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.usersWhoLiked).toHaveLength(1);
  });

  test("Test like a liked post - error", async () => {
    const response = await request.post(`/posts/like/${postId}`);
    expect(response.statusCode).toBe(406);
  });

  test("Test unlike a liked post", async () => {
    const response = await request.post(`/posts/unlike/${postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.usersWhoLiked).toHaveLength(0);
  });

  test("Test number of likes on post should equal 0", async () => {
    const response = await request.get(`/posts/${postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.usersWhoLiked).toHaveLength(0);
  });
});

describe("Delete post tests", () => {
  test("Test delete a post", async () => {
    const response = await request.delete(`/posts/${postId}`);
    expect(response.statusCode).toBe(200);
  });

  test("Test Get a deleted post- results in error", async () => {
    const response = await request.get(`/posts/${postId}`);
    expect(response.statusCode).toBe(404);
  });

  test("Test delete a deleted post", async () => {
    const response = await request.delete(`/posts/${postId}`);
    expect(response.statusCode).toBe(400);
  });
});
