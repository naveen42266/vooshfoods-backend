const express = require("express");
const passport = require("passport");
const { signup, login, googleAuth } = require("../controllers/authController");

const router = express.Router();

// Signup route
router.post("/signup", signup);

// Login route
router.post("/login", login);

// Google OAuth route (start Google login)
// router.post("/google", googleAuth);  // POST route to handle Google login via token
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback route
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), googleAuth);


// Google OAuth route
// router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback route
// router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
//   res.redirect("/"); // Redirect or handle successful login
// });

module.exports = router;



