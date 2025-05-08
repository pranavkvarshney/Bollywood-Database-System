
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

mongoose.models = {};

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});


userSchema.pre('save', async function (next) {
    try {

        if (!this.isModified('password')) {
            return next();
        }

        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        console.log(this.password);
        next();
    } catch (error) {
        next(error);
    }
});


userSchema.methods.comparePassword = async function (candidatePassword) {
    console.log("Comparing passwords");
    console.log("Password from DB exists:", !!this.password);
    try {

        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log("Password match result:", isMatch);
        return isMatch;
    } catch (error) {
        console.error("Password comparison error:", error);
        return false;
    }
};


const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;