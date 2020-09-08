
//load config
const config = require('./config');

//connect downloader
var downloader = require('./downloader');


//start specified number of threads
for (var i = 0; i < config.threads; i++){
  console.log('starting thread ' + i);
  //offset the start of each thread so that they are less likely to download the same url
  setTimeout(() => {downloader.findDownload(UrlModel, i)}, 500 * i);
}
console.log('all threads started!');
