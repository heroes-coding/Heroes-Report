var fs = require("fs");
var path = require("path");
var alreadyExisting = 0

function loadJSON (JSONName,isDic,savePath) {
  if (fs.existsSync(path.join(savePath,JSONName)))
    var thisJSON = require("./"+JSONName)
  else {
    if (isDic)
      var thisJSON = {}
    else
      var thisJSON = []
  }
  return thisJSON
}

function saveJSON (JSONObj,JSONName,savePath) {
  var toSave = JSON.stringify(JSONObj)
  fs.writeFileSync(path.join(config.programDir,JSONName), toSave, 'utf8', function (err) {
    if (err) {
    console.log(err);
    console.log("ERROR FROM saveJSON")
    }
});
}


function saveReplay(thisReplay,savePath,fileName) {
  var toSave = JSON.stringify(thisReplay)
  //console.log(savePath)
  fs.writeFileSync(savePath, toSave, 'utf8', function (err) {
    if (err) {
      console.log(err);
    }
  });
}

var callback = function (err, data) {
  if (err) return console.error(err);
};

loopsToS = function(time) {
  return parseInt((time-608)/16)
}

var http = require("http");

exports.loadJSON = loadJSON
exports.saveReplay = saveReplay
exports.saveJSON = saveJSON
exports.loopsToS = loopsToS
exports.alreadyExisting = alreadyExisting
