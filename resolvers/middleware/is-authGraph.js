const jwt = require("jsonwebtoken");

module.exports = (authHeader) => {
  if (!authHeader) {
    throw new Error("No authorization header provided. Access denied.");
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "somesupersecretsecret");
  } catch (err) {
    throw new Error("Invalid or expired token. Authentication failed.");
  }
  if (!decodedToken) {
    throw new Error("Token verification failed. User not authenticated.");
  }
};
