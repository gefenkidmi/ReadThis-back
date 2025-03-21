import { recommendBooks } from "../controllers/book_recommendation_controller";
import { getBookRecommendations } from "../services/books_service";
import { Request, Response } from "express";

jest.mock("../services/books_service");

const mockGetBookRecommendations = getBookRecommendations as jest.Mock;

describe("Tests recommendBooks", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    req = { body: {} };
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  test("Success returns recommendations when bookTitle is valid", async () => {
    req.body = { bookTitle: "Harry Potter" };
    mockGetBookRecommendations.mockResolvedValue([
      "The Hobbit",
      "Percy Jackson",
    ]);

    await recommendBooks(req as Request, res as Response);

    expect(mockGetBookRecommendations).toHaveBeenCalledWith("Harry Potter");
    expect(jsonMock).toHaveBeenCalledWith({
      recommendations: ["The Hobbit", "Percy Jackson"],
    });
  });

  test("Fail returns 400 when bookTitle is missing", async () => {
    await recommendBooks(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Book title is required.",
    });
  });

  test("Fail returns 404 when no recommendations found", async () => {
    req.body = { bookTitle: "Unknown Book" };
    mockGetBookRecommendations.mockResolvedValue([]);

    await recommendBooks(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "No similar books found.",
    });
  });

  test("Fail returns 500 when service throws an error", async () => {
    req.body = { bookTitle: "Error Book" };
    mockGetBookRecommendations.mockRejectedValue(new Error("Service failure"));

    await recommendBooks(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Internal server error.",
    });
  });
});