var express = require('express');
// var fs = require('fs');
var router = express.Router();

//load config
const config = require('./config');

//load and connect to mongodb db
var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://' + config.dbUser + ':' + config.dbPass + '@cluster0.0czcr.mongodb.net/' + config.dbName + '?retryWrites=true&w=majority');

//create schema for saving urls
var urlShema = mongoose.Schema({
 url: String,
 hash: String,
 suffix: Number,
 imgLink: String,
 downloaded: Boolean,
 assigned: Boolean,
 downloader: String
});
var UrlModel = mongoose.model("UrlModel", urlShema);

//handels search for url screenshot
router.get('/', function(req, res){

  var url = req.param('url');

  console.log('download request for: ' + url);

  //find if already in db
  UrlModel.find({url: url},
   function(err, response){
     //test to see if there are any results for required url
     if(response.length == 0){
       //adds url to db
       if(!url){ //needs to make sure it's a valid url
           res.send('please enter a valid url');
        } else {
           var newUrl = new UrlModel({
              url: url,
              hash: "fake hash",
              suffix: 0,
              imgLink: "screenshots/testImage.jpg",
              downloaded: true,
              assigned: false,
              downloader: null
           });

           newUrl.save(function(err, Person){
              if(err)
                 res.send("Database error:  " + type);
              else
                 res.send("New person url added!");
           });
        }
     }else{ //if there is already an entry in db for specified url send url
       console.log(response[0]);
       res.send(response[0]["imgLink"]);
     }
  });

});


//Routes will go here
module.exports = router;
