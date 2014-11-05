//var Ethereum = require('ethereumjs-lib');
//     // fs = require('fs'),
//     crypto = require('crypto'),
require("../node_modules/ethereumjs-lib/node_modules/secp256k1");
var     levelup = require('level');
    //trie = require("../node_modules/ethereumjs-lib/node_modules/merkle-patricia-tree");
//     path = require('path');
    // log = require('npmlog'),
    // async = require('async'),
    // mkdirp = require('mkdirp'),
    // defaults = require('../defaults.json'),
    // upnp = require('./upnp.js'),
    // mining = require('./mine.js'),
    // EthAPI = require('./eth.js'),
    // wsAPI = require('./wsRPC.js');


//open DBs
var p = process.env['HOME'] + "/.ethereum/node",
    stateDB = levelup(p + '/state'),
    blockDB = levelup(p + '/block'),
    detailsDB = levelup(p + '/details');


//create the blockchain
//self.blockchain = new Ethereum.Blockchain(blockDB, detailsDB);
//create a VM
//self.vm = new Ethereum.VM(stateDB);

//start the blockchain. This will lookup last block on the blockchain.
//self.blockchain.init();

detailsDB.get("meta", {
  valueEncoding: "json"
}, function(err, meta){
  console.log("got meta",err, meta);
});
