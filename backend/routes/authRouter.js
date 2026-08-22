import express from "express";
import {
    isAuthenticated, login, logout, register,
    resetPass, sendResetOtp, sendVerifyOtp, verifyEmail
} from "../controller/authController.js";
import userAuth from "../middleWare/userAuth.js";

const authRouter = express.Router();

// Original routes
authRouter.post('/register',          register);
authRouter.post('/login',             login);
authRouter.post('/logout',            logout);
authRouter.post('/send-verify-otp',   userAuth, sendVerifyOtp);
authRouter.post('/verify-account',    userAuth, verifyEmail);
authRouter.post('/is-auth',           userAuth, isAuthenticated);
authRouter.post('/send-reset-otp',    sendResetOtp);
authRouter.post('/reset-password',    resetPass);

// Client-facing aliases (frontend calls /signup and /signin)
authRouter.post('/signup', register);
authRouter.post('/signin', login);

export default authRouter;

