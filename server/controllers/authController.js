import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ email, password });
    
    // Send notification to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: 'New User Registration',
      text: `New user registration pending approval: ${email}`
    });

    res.status(201).json({
      message: 'Registration successful. Waiting for admin approval.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isApproved) {
      return res.status(401).json({ message: 'Account pending approval' });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      text: `Click the following link to reset your password: ${resetUrl}`
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = password;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPendingApprovals = async (req, res) => {
  try {
    const pendingUsers = await User.find({ isApproved: false }).select('-password');
    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await sendEmail({
      to: user.email,
      subject: 'Account Approved',
      text: 'Your account has been approved. You can now log in to the system.'
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.deleteOne({ _id: req.params.id });

    await sendEmail({
      to: user.email,
      subject: 'Account Registration Rejected',
      text: 'Your account registration has been rejected. Please contact support for more information.'
    });

    res.json({ message: 'User rejected and removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};