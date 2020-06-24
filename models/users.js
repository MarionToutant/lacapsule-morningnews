const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    token: String,
    salt: String,
    country: String,
    langue: String,
    articles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'articles' }],
})

const userModel = mongoose.model('users', userSchema)

module.exports = userModel