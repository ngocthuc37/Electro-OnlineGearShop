var mongoose = require('mongoose');

var orderSchema = mongoose.Schema({
    date: Date,
    userID: String,
    username: String,
    email: String,
    address: String,
    phone: String,
    note: String,
    items: [{
        name: String,
        quantity: Number
    }],
    totalCost: Number,
    status: Number
});

module.exports = mongoose.model('order', orderSchema, 'order');