require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session"); // For session handling with Passport
const { ObjectId } = require("mongodb"); // Import ObjectId from MongoDB
const { initializeCounter } = require('./db');
const todoRoutes = require("./routes/todoRoutes");
const authRoutes = require("./routes/authRoutes"); // Import the authentication routes
const { connectToDatabase, getDatabase } = require("./db");
const { PORT, ALLOWED_ORIGINS, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require("./config");
const app = express();
const { getNextUserId } = require("./controllers/authController")
// CORS configuration
app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ["POST", "PUT", "GET", "DELETE"],
  credentials: true,
}));

app.use(express.json()); // Middleware for parsing JSON

// Session middleware setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key', // Store a secure key in .env for production
  resave: false,
  saveUninitialized: true,
}));

// Initialize Passport and sessions
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport with Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "https://vooshfoods-backend.onrender.com/api/auth/google/callback",
      // "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // console.log("Profile:", profile); // Log profile to check if data is received
        const database = getDatabase();
        const userCollection = database.collection("vooshfoodsdbusercollection");

        let user = await userCollection.findOne({ googleId: profile.id });
        if (!user) {
          const userId = await getNextUserId(); 
          const result = await userCollection.insertOne({
            userId,
            googleId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            profilePicture: profile.photos[0].value
          });
          user = await userCollection.findOne({ _id: result.insertedId }); // Retrieve the full user document
        }
        

        return done(null, user);
      } catch (error) {
        console.error("Error in Google OAuth callback:", error);
        return done(error, null);
      }
    }
  )
);


// Serialize and deserialize user sessions
passport.serializeUser((user, done) => {
  // Store the user ID as a string in the session to ensure compatibility
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const database = getDatabase(); // Assuming this is your function to get the MongoDB connection
    const user = await database.collection("vooshfoodsdbusercollection").findOne({ _id: new ObjectId(id) });

    if (!user) {
      console.error("No user found for ID:", id);
      return done(new Error("User not found"), null);
    }
    console.log("Deserialized user:", user);
    done(null, user);
  } catch (error) {
    console.error("Error during deserialization:", error);
    done(error, null);
  }
});


// Register routes
app.use('/api/todo', todoRoutes);
app.use('/api/auth', authRoutes); // Register the auth routes for login, signup, Google OAuth

// Root route
app.get("/", (req, res) => {
  res.send("Hello");
});

// Start server and connect to database
app.listen(PORT, async () => {
  await connectToDatabase();
  await initializeCounter();
  console.log(`Server is running on port ${PORT}`);
});
