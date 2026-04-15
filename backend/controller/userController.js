import User from '../models/user.js'
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';


// GET users
export const getUsers = async (req,res) => {
  try{
      const users = await User.find().select("-password");
      res.json(users);
  }
  catch(error){
      res.status(500).json({message : error.message});
  }
}

// ADD user

export const addUser = async (req, res) => {
  try {
    const { role, password } = req.body;
    const loggedUser = req.user;

    // Role restrictions (keep your logic)
    if (loggedUser.role === "admin") {
      if (role === "admin" || role === "superadmin") {
        return res.status(403).json({
          message: "Admin can only create Staff or Student"
        });
      }
    }

    if (loggedUser.role === "staff") {
      if (role !== "student") {
        return res.status(403).json({
          message: "Staff can only create Student"
        });
      }
    }

    if (loggedUser.role === "student") {
      return res.status(403).json({
        message: "Student cannot create users"
      });
    }

    //  HASH PASSWORD BEFORE SAVE
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      ...req.body,
      password: hashedPassword
    });

    res.status(201).json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// LOGIN

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role : user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, 
      sameSite: "lax",
    });

    //  ONLY ONE RESPONSE
    res.status(200).json({
      message: "Login Successful",
      user,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE (password or profile)

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email,password,role,phone,gender } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Restrict role update
if (req.user.role === "admin" && role === "superadmin") {
  return res.status(403).json({
    message: "Admin cannot assign SuperAdmin role"
  });
}

if (req.user.role === "staff" && role !== "student") {
  return res.status(403).json({
    message: "Staff can only assign Student role"
  });
}

    //  Update Password
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.phone = phone || user.phone;
    user.gender = gender || user.gender;

    await user.save();

    res.json({ message: "User updated successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting user",
      error: error.message,
    });
  }
};

