const mongoose = require('mongoose');
// bcryptjs is already declared in package.json and works without native builds.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    // username remains optional for accounts created by older deployments.
    username: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, trim: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'hr', 'manager', 'employee', 'user'],
        default: 'employee'
    },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
// Middleware to hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Define the generateAuthToken method
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        { id: this._id, role: this.role }, // Payload
        process.env.JWT_SECRET, // Secret key
        { expiresIn: '1h' } // Token expiration
    );
    return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
