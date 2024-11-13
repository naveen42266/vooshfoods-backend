const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getDatabase } = require("../db");
const { COLLECTION_USER, JWT_SECRET, JWT_EXPIRY } = require("../config");

async function getNextUserId() {
  const database = getDatabase();
  const countersCollection = database.collection("counters");

  const result = await countersCollection.findOneAndUpdate(
    { _id: "userId" },
    { $inc: { userCount: 1 } },
    { returnDocument: "after" }
  );

  return result.value.userCount;
}

async function signup(req, res) {
  const { firstName, lastName, email, password, confirmPassword, gender } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  const database = getDatabase();
  const userCollection = database.collection(COLLECTION_USER);

  const existingUser = await userCollection.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ error: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = await getNextUserId(); // Get the next sequential userId

  const newUser = {
    userId, // Sequential userId
    firstName,
    lastName,
    email,
    password: hashedPassword,
    gender,
  };

  await userCollection.insertOne(newUser);
  res.json({
    message: "Signup successful",
    user: {
      userId,
      firstName,
      lastName,
      email,
      gender,
    },
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  const database = getDatabase();
  const userCollection = database.collection(COLLECTION_USER);

  const user = await userCollection.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = jwt.sign({ id: user.userId, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

  res.json({
    message: "Login successful",
    token,
    user: {
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      gender: user.gender,
    },
  });
}

// Simplified googleAuth function using req.user from Passport
async function googleAuth(req, res) {
  try {
    const user = req.user; // Retrieved from Passport's `req.user` after successful authentication

    // Generate a custom JWT token for the user
    const token = jwt.sign({ id: user.userId, email: user.email, firstName: user.firstName, lastName: user.lastName, profilePicture: user.profilePicture }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    // res.redirect(`http://localhost:3000?token=${token}`);
    res.redirect(`https://vooshfoods-frontend.vercel.app?token=${token}`);
    // https://vooshfoods-frontend.vercel.app
    // res.json({
    //   message: "Google login successful",
    //   token, // Send JWT token back to the frontend
    //   user: {
    //     userId: user._id,
    //     firstName: user.firstName,
    //     lastName: user.lastName,
    //     email: user.email,
    //   },
    // });
  } catch (error) {
    res.status(500).json({ error: "Error during Google authentication" });
  }
}



// Placeholder function for Google login (implement OAuth strategy below)
// async function googleAuth(req, res) {
//   res.json({ message: "Google login successful", user: req.user });
// }

module.exports = { signup, login, googleAuth, getNextUserId };
