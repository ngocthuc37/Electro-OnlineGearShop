// Models
var Product = require('../models/product');
var Comment = require('../models/comment');

// Function
var functions = require('./functions');


// Store
exports.displayProducts = (req, res) => {
	// Validate query string
	const category = (typeof req.query.category != 'undefined') ? (req.query.category) : '';
	const producer = (typeof req.query.producer != 'undefined') ? (req.query.producer) : '';
	const min = (typeof req.query.min != 'undefined') ? parseInt(req.query.min) : 0;
	const max = (typeof req.query.max != 'undefined') ? parseInt(req.query.max) : 50000000;
	const sort = (typeof req.query.sort != 'undefined') ? (req.query.sort) : '';
	const count = (typeof req.query.count != 'undefined') ? parseInt(req.query.count) : 12;
	const page = (typeof req.query.page != 'undefined') ? parseInt(req.query.page) : 1;

	// Arguments for find and sort query
	let findParams = {};
	let sortParams = {};
	// URI query string
	let filterStr = '';
	let sortStr = '';

	if (category != '') {
		findParams.category = category;
		filterStr += ('category=' + category + '&');
	}
	if (producer != '') {
		findParams.producer = producer;
		filterStr += ('producer=' + producer + '&');
	}

	findParams.price = { $gte: min, $lte: max };
	filterStr += ('min=' + min + '&max=' + max + '&');

	if (sort != '') {
		sortStr += ('sort=' + sort + '&');
		switch (sort) {
			case 'name-asc':
				sortParams.name = 1; break;
			case 'name-des':
				sortParams.name = -1; break;
			case 'price-asc':
				sortParams.price = 1; break;
			case 'price-des':
				sortParams.price = -1;
		}
	}

	Product.countDocuments(findParams) // Count the total number of products
		.then(countAll => {
			Product.find(findParams).sort(sortParams).limit(count).skip((page - 1) * count) // Sorting and Pagination
				.then(products => {
					res.render('pages/product/store', {
						user: req.user, // User
						products: products,
						priceConverter: functions.numberWithCommas,
						// Query string
						filterStr: filterStr, sortStr: sortStr,
						// Remain selections
						category: category, producer: producer, min: min, max: max, sort: sort, count: count, page: page,
						// Creating page index
						countPages: parseInt(countAll / count +
							((countAll % count == 0) ? 0 : 1)),
						countAll: countAll
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

// Product Info
exports.productInfo = (req, res) => {
	const page = (typeof req.query.page != 'undefined') ? parseInt(req.query.page) : 1;
	const commentsPerPage = 3;

	// Find the product that matches ID and increase views by 1
	Product.findOneAndUpdate({ _id: req.params.id }, { $inc: { 'views': 1 } }, { new: true, useFindAndModify: false })
		.then(product => {
			Comment.countDocuments({ productID: product._id }) // Count all comments that match product ID
				.then(countAll => {
					Comment.find({ productID: product._id })
						.limit(commentsPerPage).skip((page - 1) * commentsPerPage) // Pagination
						.then(comments => {
							Product.find({ producer: product.producer }) // Find related products
								.then(relatedProducts => {
									res.render('pages/product/product', {
										user: req.user,
										product: product,
										views: product.views + 1, // Actual views will increase later
										priceConverter: functions.numberWithCommas,
										// Comments
										comments: comments,
										// Creating page index
										countPages: parseInt(countAll / commentsPerPage +
											((countAll % commentsPerPage == 0) ? 0 : 1)),
										page: page,
										i: 1,
										// Related products
										products: relatedProducts
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

// Advance Filter
exports.filter = (req, res) => {
	const category = (typeof req.body.category != 'undefined') ? (req.body.category) : '';
	const producer = (typeof req.body.producer != 'undefined') ? (req.body.producer) : '';
	const min = req.body.min;
	const max = req.body.max;

	let queryStr = '';
	if (category != '') {
		queryStr += ('category=' + category + '&');
	}
	if (producer != '') {
		queryStr += ('producer=' + producer + '&');
	}
	queryStr += 'min=' + min + '&';
	queryStr += 'max=' + max;
	res.redirect('/store?' + queryStr);
}

// Search Result Page
exports.searchPage = (req, res) => {
	const name = req.query.name;
	const category = (typeof req.query.category != 'undefined') ? (req.query.category) : '';
	const count = (typeof req.query.count != 'undefined') ? parseInt(req.query.count) : 12;
	const page = (typeof req.query.page != 'undefined') ? parseInt(req.query.page) : 1;

	let queryParams = { $or: [{ name: new RegExp(name, "i") }] };
	if (category != '') {
		queryParams.category = category;
	}

	Product.countDocuments(queryParams) // Count all
		.then(countAll => {
			Product.find(queryParams).limit(count).skip((page - 1) * count) // Paginate
				.then(products => {
					res.render('pages/product/search', {
						user: req.user,
						products: products,
						priceConverter: functions.numberWithCommas,
						// Remain selections
						name: name,
						category: category,
						count: count,
						page: page,
						// Create page index
						countPages: parseInt(countAll / count +
							((countAll % count == 0) ? 0 : 1)),
						countAll: countAll
					});
				})
				.catch(err => console.log(err));
		})
		.catch(err => console.log(err));
}

// Search Handle
exports.searchHandle = (req, res) => {
	const category = (typeof req.body.category != 'undefined') ? (req.body.category) : '';
	const name = req.body.name;

	let queryStr = 'name=' + name + '&';
	if (category != '') {
		queryStr += ('category=' + category + '&');
	}
	queryStr += ('count=12&page=1');

	let redirect = '/search?' + queryStr;

	res.redirect('/search?' + queryStr);
}

// Product comment
exports.comment = (req, res) => {
	const productID = req.params.id;
	const username = req.body.name;
	const content = req.body.content;
	const newComment = new Comment({ productID, username, content });
	newComment.save()
		.then(comment => {
			res.redirect('/product/' + req.params.id);
		})
		.catch(err => {
			console.log('Error: ', err);
			throw err;
		});
}

// Cart
exports.cart = (req, res) => {
	res.render('pages/order/cart', { user: req.user });
}