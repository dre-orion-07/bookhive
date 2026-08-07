import { AppError } from "./AppError.js";
import { ErrorCodes } from "./ErrorCodes.js";

export const ErrorFactory = {
  validation: (message: string) => new AppError(message, 422, ErrorCodes.VALIDATION_ERROR),

  authenticationFailed: (message = "Invalid credentials.") =>
    new AppError(message, 401, ErrorCodes.AUTHENTICATION_FAILED),

  tokenExpired: (message = "Token has expired.") =>
    new AppError(message, 401, ErrorCodes.TOKEN_EXPIRED),

  tokenInvalid: (message = "Invalid token.") =>
    new AppError(message, 401, ErrorCodes.TOKEN_INVALID),

  accessDenied: (message = "You do not have permission to perform this action.") =>
    new AppError(message, 403, ErrorCodes.ACCESS_DENIED),

  userNotFound: (message = "User not found.") =>
    new AppError(message, 404, ErrorCodes.USER_NOT_FOUND),

  emailAlreadyExists: (message = "An account with this email already exists.") =>
    new AppError(message, 409, ErrorCodes.EMAIL_ALREADY_EXISTS),

  usernameAlreadyExists: (message = "This username is already taken.") =>
    new AppError(message, 409, ErrorCodes.USERNAME_ALREADY_EXISTS),

  internal: (message = "Something went wrong. Please try again.") =>
    new AppError(message, 500, ErrorCodes.INTERNAL_ERROR),

  bookNotFound: (message = "Book not found.") =>
    new AppError(message, 404, ErrorCodes.BOOK_NOT_FOUND),

  bookshelfNotFound: (message = "Bookshelf not found.") =>
    new AppError(message, 404, ErrorCodes.BOOKSHELF_NOT_FOUND),

  reviewNotFound: (message = "Review not found.") =>
    new AppError(message, 404, ErrorCodes.REVIEW_NOT_FOUND),

  clubNotFound: (message = "Book club not found.") =>
    new AppError(message, 404, ErrorCodes.CLUB_NOT_FOUND),
};
