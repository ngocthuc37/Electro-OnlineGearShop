var Product = require('../models/product');
var functions = require('./functions');

exports.index = (req, res) => {
    Product.find({})
		.then(products => {
			res.render('pages/home/index', {
                products: products,
                user: req.user,
                priceConverter: functions.numberWithCommas });
		})
		.catch(err => {
			console.log('Error: ', err);
			throw err;
		});
}