var mongoose = require('mongoose');

var commentSchema = mongoose.Schema({
    productID: { type: String },
    username: { type: String },
    content: { type: String },
});

module.exports = mongoose.model('comment', commentSchema, 'comment');