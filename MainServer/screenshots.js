var express = require('express');
// var fs = require('fs');
var router = express.Router();
var crypto = require('crypto');

//using md5 hash to make image files faster to find and shorter names also acts as a rudimentary hash set

//load config
const config = require('./config');

//load and connect to mongodb db
var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://' + config.dbUser + ':' + config.dbPass +
'@cluster0.0czcr.mongodb.net/' + config.dbName + '?retryWrites=true&w=majority');

//create schema for saving urls
var urlShema = mongoose.Schema({
 url: String,
 hash: String,
 suffix: Number,
 imgLink: String,
 downloaded: Boolean,
 assigned: Boolean,
 downloader: String,
 downloadStartTime: Number
});
var UrlModel = mongoose.model("UrlModel", urlShema);

//handels search for url screenshot
router.get('/', function(req, res){

  var url = req.param('url');

  console.log('download request for: ' + url);

  //find if already in db
  UrlModel.find({url: url},
   function(err, response){
     //deal with errors
     if(err){
       console.log(result);
       return console.error(err);
     }

     //test to see if there are any results for required url
     if(response.length == 0){
        //stores the hash of the url for faster file managment
        var hash = crypto.createHash('md5').update(url).digest("hex");

       //adds url to db
       if(!url){ //needs to make sure it's a valid url
           res.send('please enter a valid url');
        } else {
          //call save new url funciton to create a new entry for this url
          saveNewUrl(UrlModel, url, hash, function(err, response){
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


//function to save new url entry
function saveNewUrl(UrlModel, url, hash, callback){
  getSuffix(UrlModel, hash, function(err, response, suffix){
    var newUrl = new UrlModel({
       url: url,
       hash: hash,
       suffix: suffix,
       imgLink: "screenshots/" + hash + suffix.toString() + ".jpg",
       downloaded: false,
       assigned: false,
       downloader: null,
       downloadStartTime: null
    });

    newUrl.save(function(err, Person){
       if(err)
          return ("Database error:  " + type);
       else
        callback(err, response);
    });
  })
}

//function to check for hash collisions and come up with suffix to fix this problem
function getSuffix(UrlModel, hash, callback){
  var suffix = 0;
  UrlModel.find({hash: hash}, function(err, response){
    suffix = response.length; //this will always return the next int for a suffix with common hash
    //console.log('response length: ' + suffix);
    callback(err, response, suffix);
  });
}
