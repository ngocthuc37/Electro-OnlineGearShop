const functions = require('../controllers/functions');
var Order = require('../models/order');

// Order Management
exports.orderManagement = (req, res) => {
    Order.find({ userID: req.user._id })
        .then(orders => {
            res.render('pages/order/order-management', {
                user: req.user,
                orders: orders,
                priceConverter: functions.numberWithCommas,
                changeDateFormat: functions.changeDateFormat
            });
        })
        .catch(err => console.log(err));
}

// Checkout Handle
exports.checkoutHandle = (req, res) => {
    var tokens = req.body.items.split('//');
    tokens.pop(); // The last element is empty

    var newOrder = new Order({
        date: new Date(),
        userID: req.user._id,
        username: req.body.name,
        email: req.body.email,
        address: req.body.address,
        phone: req.body.phone,
        note: req.body.note,
        totalCost: req.body.total,
        status: 0
    })

    tokens.forEach(entry => {
        var properties = entry.split(';');
        newOrder.items.push({
            _id: properties[0],
            name: properties[1],
            quantity: parseInt(properties[2])
        });
    });

    newOrder.save();

    res.redirect('/users/order-management');
}

// Track Order
exports.trackOrder = (req, res) => {
    const id = req.params.id;

    Order.findOne({ _id: id })
    .then(order => {
        res.render('pages/order/track-order', {
            user: req.user,
            order: order,
            priceConverter: functions.numberWithCommas
        });
    })
    .catch(err => console.log(err));
}