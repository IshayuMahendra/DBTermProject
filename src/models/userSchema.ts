"use server";
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
    username: string;
    salted_password: string;
    display_name: string;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true
    },
    salted_password: {
        type: String,
        required: true
    },
    display_name: {
        type: String,
        required: true
    }
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User

