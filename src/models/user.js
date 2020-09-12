const mongoose = require('mongoose');
const validator = require('validator');
const bCrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number');
            }
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password must be greater than 6 characters and must not contain the word "passowrd"');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        data: {
            type: Buffer
        },
        mimeType: {
            type: String
        }
    }
},
{
    timestamps: true // to enable createdAt and updatedAt
});

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Unable to login');
    }

    const isMatch = await bCrypt.compare(password, user.password);
    if(!isMatch) {
        throw new Error('Unable to login');
    }

    return user;
};

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

// to set up relationship between entities, virtual fields are not stored in db
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'createdBy'
    // foreign key for this virtual field. constructed as localField = Task.createdBy
});

userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bCrypt.hash(user.password, parseInt(process.env.HASH_ROTATION));
        // if password is changed we should log out user from all sessions
        user.tokens = [];
    }
    next();
});

// delete tasks when user is removed
userSchema.pre('remove', async function(next) {
    const user = this;
    await Task.deleteMany({ createdBy: user._id })
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;