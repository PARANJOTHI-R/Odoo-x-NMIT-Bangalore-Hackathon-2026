import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
    findUserByEmail,
    findUserById,
    createUser,
    updateVerificationOtp,
    verifyUserAccount,
    updateResetOtp,
    updatePassword
} from '../models/userModel.js';
import transporter from '../config/nodeMailer.js';

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing details' });
    }

    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.json({ success: false, message: "User already exist" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Explicitly set role = 'hr' per requirements
        const user = await createUser({
            name,
            email,
            passwordHash: hashedPassword,
            role: 'hr'
        });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Dayflow',
            text: `Welcome to Dayflow. Your account has been created with email id: ${email}`
        };

        try {
            await transporter.sendMail(mailOptions);
            return res.json({ success: true, message: 'User registered and welcome email sent' });
        } catch (emailError) {
            console.error("Email sending failed during registration:", emailError.message);
            return res.json({ success: false, message: `User registered successfully, but failed to send welcome email: ${emailError.message}` });
        }

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ success: false, message: 'Email and Password are required' });
    }

    try {
        const user = await findUserByEmail(email);

        if (!user) {
            return res.json({ success: false, message: 'Invalid email' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.json({ success: false, message: 'Incorrect Password' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ success: true });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        });

        return res.json({ success: true, message: 'Logged out' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const sendVerifyOtp = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await findUserById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.is_acc_verified) {
            return res.json({ success: false, message: "Account Already verified" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await updateVerificationOtp(user.id, otp, expiresAt);

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account verification Otp',
            text: `Your otp is ${otp}. Verify your account using this Otp.`
        };

        try {
            await transporter.sendMail(mailOptions);
            return res.json({ success: true, message: 'Verification Otp sent to Your Email' });
        } catch (emailError) {
            console.error("Email sending failed for verification OTP:", emailError.message);
            return res.json({ success: false, message: `OTP generated but failed to send email: ${emailError.message}` });
        }

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    const { otp } = req.body;
    const userId = req.user.id;

    if (!userId || !otp) {
        return res.json({ success: false, message: 'Missing details' });
    }

    try {
        const user = await findUserById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not Found' });
        }

        if (!user.verify_otp || user.verify_otp !== otp) {
            return res.json({ success: false, message: 'Invalid Otp' });
        }

        if (new Date(user.verify_otp_expire) < new Date()) {
            return res.json({ success: false, message: 'Otp Expired' });
        }

        await verifyUserAccount(user.id);

        return res.json({ success: true, message: 'Email verified successfully' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: "Email is required" });
    }

    try {
        const user = await findUserByEmail(email);

        if (!user) {
            return res.json({ success: false, message: "User does not exist" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await updateResetOtp(user.id, otp, expiresAt);

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password reset Otp',
            text: `Your otp is ${otp}. Reset your account Password using this Otp.`
        };

        try {
            await transporter.sendMail(mailOptions);
            return res.json({ success: true, message: "Otp sent to your mail" });
        } catch (emailError) {
            console.error("Email sending failed for reset OTP:", emailError.message);
            return res.json({ success: false, message: `OTP generated but failed to send email: ${emailError.message}` });
        }

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const resetPass = async (req, res) => {
    const { otp, email, newPass } = req.body;

    if (!email || !otp || !newPass) {
        return res.json({ success: false, message: "Email otp and new password are required" });
    }

    try {
        const user = await findUserByEmail(email);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (!user.reset_otp || user.reset_otp !== otp) {
            return res.json({ success: false, message: "Invalid Otp" });
        }

        if (new Date(user.reset_otp_expire) < new Date()) {
            return res.json({ success: false, message: "Otp Expired" });
        }

        const hashedPassword = await bcrypt.hash(newPass, 10);

        await updatePassword(user.id, hashedPassword);

        return res.json({
            success: true,
            message: "Password have been reset successfully"
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};