var mongoose = require('mongoose');

var orderSchema = mongoose.Schema({
    userID: String,
    username: String,
    email: String,
    address: String,
    phone: String,
    note: String,
    date: Date,
    items: [{
        name: String,
        quantity: Number
    }],
    totalCost: Number,
    status: Number
});

module.exports = mongoose.model('order', orderSchema, 'order');