import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const postSignUp = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExist = await User.findOne({ email });
        if (userExist)
            return res.status(400).json({ msg: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 12); // 
        const newUser = await User.create({ name, email, password: hashedPassword });

        return res.status(201).json({ msg: "New user created", data: { userId: newUser._id } });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Unable to create user", error });
    }
};
