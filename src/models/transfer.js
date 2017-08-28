var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DishSchema = new Schema({
    category:    {
	type: String,
    	required: true
    },
    name: {
    	type: String, 
    	required: true
    },
    description: {
    	type: String, 
    },
    size: {
    	type: Number, 
    },
    price: {
    	type: Number, 
	min: 0, 
	default: 0,
    	required: true
    }, 
    isEveryday: Boolean
});


var Dish = mongoose.model('Dish', DishSchema);
module.exports = Dish;
module.exports.Schema = DishSchema;
