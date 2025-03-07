import { Request, Response } from "express";
import { Model } from "mongoose";

class BaseController<T> {
  model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async getAll(req: Request, res: Response) {
    const filter = req.query.owner;
    try {
      if (filter) {
        const posts = await this.model.find({ owner: filter });
        res.send(posts);
      } else {
        const posts = await this.model.find();
        res.send(posts);
      }
    } catch (error) {
      res.status(400).send(error);
    }
  }

  async getAllPopulated(
    req: Request,
    res: Response,
    path: string,
    select?: string
  ) {
    try {
      const obj = await this.model.find().populate(path, select);
      if (!obj) res.status(404);
      res.send(obj);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }

  async getById(req: Request, res: Response) {
    const postId = req.params.id;

    try {
      const post = await this.model.findById(postId);
      console.log(post);
      if (post != null) {
        res.send(post);
      } else {
        res.status(404).send("Post not found");
      }
    } catch (error) {
      res.status(400).send(error);
    }
  }

  async getByIdPopulated(
    req: Request,
    res: Response,
    path: string,
    select?: string
  ) {
    try {
      const obj = await this.model
        .findById(req.params.id)
        .populate(path, select);
      if (!obj) res.status(404);
      res.send(obj);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }

  async createItem(req: Request, res: Response) {
    const postBody = req.body;
    try {
      const post = await this.model.create(postBody);
      res.status(201).send(post);
    } catch (error) {
      res.status(400).send(error);
    }
  }

  async deleteItem(req: Request, res: Response) {
    const postId = req.params.id;
    try {
      const rs = await this.model.findByIdAndDelete(postId);
      res.status(200).send(rs);
    } catch (error) {
      res.status(400).send(error);
    }
  }
}

export default BaseController;
