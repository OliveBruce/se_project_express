class InternalServerError extends Error {
  constructor(message = "Server Error") {
    super(message);
    this.name = "ServerError";
    this.statusCode = 500;
  }
}

module.exports = { InternalServerError };
