var //leveldown = require("leveldown"),
level = require("level");

// var options = {
//   createIfMissing: true,
//   errorIfExists: false,
//   keyEncoding: 'utf8',
//   valueEncoding: 'utf8',
//   compression: true
// };

// var lddb = leveldown(process.env['HOME'] + '/.ethereum/node/details');

// lddb.open({}, function(err){
//   if(err){
//     console.log("err:");
//   } else {
//     console.log("leveldown: opened");
//     lddb.get("meta", {
//       valueEncoding: "json"
//     }, function(err, meta){
//       if(err) throw err;
//       console.log("meta",meta);
//     });
//   }
// });
var Ethereum = require('ethereumjs-lib'),
    fs = require('fs'),
    crypto = require('crypto'),
    levelup = require('level'),
    //path = require('path'),
    log = require('npmlog'),
    async = require('async'),
    defaults = require('./defaults.json'),
    upnp = require('./lib/upnp.js'),
    mining = require('./lib/mine.js'),
    EthAPI = require('./lib/eth.js');

var path =  process.env['HOME'] + "/.ethereum/node",
    stateDB = levelup(path + '/state'),
    blockDB = levelup(path + '/block'),
    detailsDB = levelup(path + '/details');

detailsDB.get("meta", {
  valueEncoding: "json"
}, function(err, meta){
  console.log("got meta",err, meta);
});


// level(process.env['HOME'] + '/.ethereum/node/details').get("meta", {
//   valueEncoding: "json"
// }, function(err, meta){
//   console.log("got meta",err, meta);
// });

