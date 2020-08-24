
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

//function to find and start downloads for new screenshots
async function findDownload(UrlModel, identifier){
  console.log('thread ' + identifier + ' looking for new download');
  //prevent stack overflow
  await Promise.resolve();

  //will find all websites that still need their screenshts downloaded
  UrlModel.find({downloaded: false, assigned: false},
    function(err, response){
      //deal with errors
      if(err){
        console.log(result);
        return console.error(err);
      }

      console.log(response.length + ' potential websites found');

      //return if there are no websites that need screenshots
      if (response.length ==0){
        console.log('no websites requiring screenshots found');
        //wait for min number of seconds and then search for next ss to be downloaded
        setTimeout(function(){findDownload(UrlModel, identifier)}, 5000);
      } else {

        //for now we will just use the top result but later we will build better
        //rankng system for which screnshots to download first
        var urlToDownload = response[0];
        console.log('starting download for ' + urlToDownload._id);

        //set us as the downloader for this url
        UrlModel.update({_id: urlToDownload._id},
          {
            assigned: true,
            downloader: config.serverName,
            downloadStartTime: new Date().getTime()
          }, function(err, response){
              if(err){
                console.log(result);
                return console.error(err);
              }

              //TODO
              //stuff goes here
=          })
      }
    })

  //after finnished wait for min number of seconds and then search for next ss to be downloaded
  setTimeout(function(){findDownload(UrlModel, identifier)}, 30000);
}

//start specified number of threads
for (var i = 0; i < config.threads; i++){
  console.log('starting thread ' + i);
  findDownload(UrlModel, i);
}
console.log('all threads started!');
