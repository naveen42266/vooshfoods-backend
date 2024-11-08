module.exports = {
    PORT: process.env.PORT || 8080,
    MONGO_URI: `mongodb+srv://${process.env.USER_NAME}:${process.env.PASS_WORD}@cluster0.zbounx6.mongodb.net/?retryWrites=true&w=majority`,
    DATABASE_NAME: process.env.DATABASE_NAME,
    COLLECTION_NAME: process.env.COLLECTION_NAME,
    ALLOWED_ORIGINS: ["http://localhost:3000"]
  };
  