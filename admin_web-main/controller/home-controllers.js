var Product = require('../models/product');
var User = require('../models/user');
var Order = require('../models/order');

var functions = require('./functions');

// exports.index = (req, res) => {
// 	res.render('pages/index');
// }

exports.index = (req, res) => {
	Order.find({}) // Find all orders
		.then(orders => {
			User.countDocuments({}) // Count the number of users
				.then(countUsers => {
					Order.aggregate([ // Group by item name and count quantity per order
						{
							'$unwind': {
								'path': '$items'
							}
						}, {
							'$group': {
								'_id': '$items.name',
								'totalAmount': {
									'$sum': '$items.quantity'
								}
							}
						}
					]).sort({ 'totalAmount': -1 }).limit(10) // Top 10 products
						.then(top10 => {
							Order.aggregate([ // Group by date and count totalSales
								{
									'$group': {
										'_id': {
											'$dateToString': {
												'format': '%d/%m/%Y',
												'date': '$date'
											}
										},
										'totalSales': {
											'$sum': '$totalCost'
										}
									}
								}
							]).sort({ '_id': -1 })
								.then(data => {
									// Total sales
									var totalSales = 0;
									orders.forEach(entry => {
										totalSales += entry.totalCost;
									});

									res.render('pages/index', {
										priceConverter: functions.numberWithCommas,
										totalSales: totalSales,
										countOrders: orders.length,
										countUsers: countUsers,
										top10: top10,
										data: data
									});
								})
								.catch(err => {
									console.log('Error: ', err);
									throw err;
								});
						})
						.catch(err => {
							console.log('Error: ', err);
							throw err;
						});
				})
				.catch(err => {
					console.log('Error: ', err);
					throw err;
				});
		})
		.catch(err => {
			console.log('Error: ', err);
			throw err;
		});
}