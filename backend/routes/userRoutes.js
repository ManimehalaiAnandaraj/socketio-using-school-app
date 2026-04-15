import express from 'express'
import {
  getUsers,
  addUser,
  deleteUser,
  updateUser,
  loginUser
} from '../controller/userController.js'
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/user.js';
import { authorizedRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

//  AUTH 
router.post('/login', loginUser);

// GET LOGGED USER 
router.get('/me', protect, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {
    console.log("Get Me Error", error);
    res.status(500).json({ message: error.message });
  }
});

// GET USERS → only admin & superadmin
router.get(
  '/',
  protect,
  authorizedRoles("superadmin","admin","staff","student"),
  getUsers
);

// ADD USER → superadmin, admin, staff
router.post(
  '/',
  protect,
  authorizedRoles("superadmin", "admin", "staff"),
  addUser
);

// UPDATE → admin & superadmin
router.put(
  '/:id',
  protect,
  authorizedRoles("superadmin", "admin"),
  updateUser
);

// DELETE → only superadmin
router.delete(
  '/:id',
  protect,
  authorizedRoles("superadmin"),
  deleteUser
);

export default router;