const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    default: null,
    validate(age) {
      if (age < 0) {
        throw new Error('Age must be a positive number')
      }
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate(email) {
      if (!validator.isEmail(email))
        throw new Error("Email not valid")
    }
  },
  password: {
    type: String,
    trim: true,
    required: true,
    minlength: 6,
    validate(password) {
      if (password.toLowerCase().includes("password"))
        throw new Error("No Cheating! Password can't contain the word 'password' :)")
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    },
  }],
  avatar: {
    type: Buffer
  }
}, {
  timestamps: true
})

userSchema.virtual('tassks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
})

//access to this method from instance of the model
userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, process.env.secret_key)
  user.tokens = user.tokens.concat({ token })
  await user.save()
  return token
}

userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()
  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar
  return userObject
}
//so you have access to this method directly from model
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email })
  if (!user)
    throw new Error('Unable to login')
  if (!password || !email)
    throw new Error('Please provide both username and password')
  passwordMatched = await bcrypt.compare(password, user.password)
  console.log(passwordMatched)
  if (!passwordMatched)
    throw new Error('Unable to login')
  return user
}
//hash the plain text password before saving
userSchema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password'))
    user.password = await bcrypt.hash(user.password, 8)
  next()
})

userSchema.pre('remove', async function (next) {
  const user = this
  await Task.deleteMany({ owner: user._id })
  next()
})
const User = mongoose.model('User', userSchema)


module.exports = User