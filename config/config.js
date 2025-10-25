require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET || "supersecretkey12345",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
  },
  gnews: {
    apiKey: process.env.GNEWS_API_KEY,
    baseUrl: process.env.GNEWS_BASE_URL || "https://gnews.io/api/v4",
  },
};
