var mongoose = require('mongoose');

//create schema for saving urls
var urlShema = mongoose.Schema({
 url: String,
 hash: String,
 suffix: Number,
 imgLink: String,
 fileName: String,
 downloaded: Boolean,
 assigned: Boolean,
 downloader: String,
 downloadStartTime: Number
});

module.exports = new mongoose.model('UrlModel', urlShema)
