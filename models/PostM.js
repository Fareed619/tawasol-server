const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,

    },
    text: {
        type: String,
        requierd: true,
    },
    name: {
        type: String,

    },
    likes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
            }
        }
    ],
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
            },
            text: {
                type: String,
                required: true,
            },
            name: {
                type: String,
            },
            date: {
                type: Date,
                default: Date.now()
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now()
    }


});

module.exports = Post = mongoose.model("post", postSchema);