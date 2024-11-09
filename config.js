module.exports = {
    PORT: process.env.PORT || 8080,
    MONGO_URI: `mongodb+srv://${process.env.USER_NAME}:${process.env.PASS_WORD}@cluster0.zbounx6.mongodb.net/?retryWrites=true&w=majority`,
    DATABASE_NAME: process.env.DATABASE_NAME,
    COLLECTION_NAME: process.env.COLLECTION_NAME,
    ALLOWED_ORIGINS: ["http://localhost:3000","https://vooshfoods-frontend.vercel.app","https://vooshfoods-frontend-naveen4.vercel.app","https://vooshfoods-frontend-git-main-naveen4.vercel.app","https://todo-vooshfoods.vercel.app","https://todo-vooshfoods-naveen4.vercel.app","https://todo-vooshfoods-git-main-naveen4.vercel.app"],
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRY: process.env.JWT_EXPIRY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    COLLECTION_USER: process.env.COLLECTION_USER,
    SESSION_SECRET: process.env.SESSION_SECRET
  };
  