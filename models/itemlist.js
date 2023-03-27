const mongoose = require('mongoose');
const itemListSchema = new mongoose.Schema({
titleinput: {
    type: String,
    required: true
    },
textinput: {
    type: String,
    required: true
},
linkinput: {
    type: String,
    required: true
},
numinput: {
    type: Number,
    required: true
},
regioninput: {
    type: String
},
countryinput: {
    type: [String]
    
},
healthriskinput: {
    type: [String]
},
citationinput: {
    type: String
},
date: {
    type: Date,
    default: Date.now
}
})
module.exports = mongoose.model('ItemList',itemListSchema,'items');