var mongoose = require('mongoose');

var productSchema = mongoose.Schema({
    name: { type: String },
    category: { type: String },
    imgSrc: { type: String },
    price: { type: Number },
    old_price: { type: Number },
    producer: { type: String },
    description: { type: String },
    configuration: { type: String },
    views: { type: Number },
    quantity: {type: Number}
});

module.exports = mongoose.model('product', productSchema, 'product');