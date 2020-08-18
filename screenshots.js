var express = require('express');
var fs = require('fs');
var router = express.Router();

//handels search for url screenshot
router.get('/:url', function(req, res){
  var filename = 'screenshots/' + encodeForFile(req.params.url) + '.jpeg';
  try {
      //checks to see if the screenshot has already been downloaded yet
    if (fs.existsSync(filename)) {
      console.log('redirecting to ' + filename);
      res.redirect('../' + filename);
    }
  } catch(err) {
    console.error(err)
  }

  //downloads screenshots
  download(filename);

 res.send("downloading now!" + "\n" + filename);
});


//Routes will go here
module.exports = router;

//downloads screenshots
function download(filename) {
  fs.writeFile(filename, function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
}


//encodes the urls to filenames
function encodeForFile(filename){
  var final = encodeURIComponent(filename);
  final =  final.replace('.', '%%2E');
  return final;
}
