import mongoose, { Types } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String,
})

userSchema.pre("save", async () => {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(password, 10);
})

userSchema.methods.comparePassword = (password) => {
    return bcrypt.compare(this.password, password)
}

export const User = mongoose.model("User", userSchema);

