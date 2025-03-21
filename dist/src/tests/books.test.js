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
Object.defineProperty(exports, "__esModule", { value: true });
const book_recommendation_controller_1 = require("../controllers/book_recommendation_controller");
const books_service_1 = require("../services/books_service");
jest.mock("../services/books_service");
const mockGetBookRecommendations = books_service_1.getBookRecommendations;
describe("Tests recommendBooks", () => {
    let req;
    let res;
    let statusMock;
    let jsonMock;
    beforeEach(() => {
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        req = { body: {} };
        res = {
            status: statusMock,
            json: jsonMock,
        };
    });
    test("Success returns recommendations when bookTitle is valid", () => __awaiter(void 0, void 0, void 0, function* () {
        req.body = { bookTitle: "Harry Potter" };
        mockGetBookRecommendations.mockResolvedValue([
            "The Hobbit",
            "Percy Jackson",
        ]);
        yield (0, book_recommendation_controller_1.recommendBooks)(req, res);
        expect(mockGetBookRecommendations).toHaveBeenCalledWith("Harry Potter");
        expect(jsonMock).toHaveBeenCalledWith({
            recommendations: ["The Hobbit", "Percy Jackson"],
        });
    }));
    test("Fail returns 400 when bookTitle is missing", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, book_recommendation_controller_1.recommendBooks)(req, res);
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
            error: "Book title is required.",
        });
    }));
    test("Fail returns 404 when no recommendations found", () => __awaiter(void 0, void 0, void 0, function* () {
        req.body = { bookTitle: "Unknown Book" };
        mockGetBookRecommendations.mockResolvedValue([]);
        yield (0, book_recommendation_controller_1.recommendBooks)(req, res);
        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({
            message: "No similar books found.",
        });
    }));
    test("Fail returns 500 when service throws an error", () => __awaiter(void 0, void 0, void 0, function* () {
        req.body = { bookTitle: "Error Book" };
        mockGetBookRecommendations.mockRejectedValue(new Error("Service failure"));
        yield (0, book_recommendation_controller_1.recommendBooks)(req, res);
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
            error: "Internal server error.",
        });
    }));
});
//# sourceMappingURL=books.test.js.map