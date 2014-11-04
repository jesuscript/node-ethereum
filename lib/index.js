var Ethereum = require('ethereumjs-lib'),
    fs = require('fs'),
    crypto = require('crypto'),
    levelup = require('level'),
    path = require('path'),
    log = require('npmlog'),
    async = require('async'),
    mkdirp = require('mkdirp'),
    defaults = require('../defaults.json'),
    upnp = require('./upnp.js'),
    mining = require('./mine.js'),
    EthAPI = require('./eth.js'),
    wsAPI = require('./wsRPC.js');

//a no-op
function noop(done) {
  done();
}

/**
 * @constructor
 */
var App = module.exports = function(settings) {

  this.settings = settings ? settings : {};
  this.plugins = {};
  this.log = log;

  //a queue of transaction that have yet to be inculded in the blockchain
  this.pendingTxs = [];
  this.isSyncing = false;

  //set the default path for the config and database files
  defaults.path = process.env['HOME'] + '/.ethereum/node';

  //add the defaults
  for (var prop in defaults) {
    if (this.settings[prop] === void 0) this.settings[prop] = defaults[prop];
  }

  //create API
  this.api = new EthAPI(this);
};

//attach sync function
App.prototype._sync = require('./sync.js');

//attach mining functions
App.prototype.startMining = mining.start;
App.prototype.stopMining = mining.stop;
App.prototype.toggleMining = mining.toggle;

/**
 * Starts the client
 * @method start
 * @param {Function} cb a callback
 */
App.prototype.start = function(cb) {

  var self = this;

  /**
   * Checks the for the db folder and creates a new folder if it doesn't exist
   * @method checkPath
   * @param {Function} done
   * @private
   */
  function checkPath(done) {
    fs.exists(self.settings.path, function(exists) {
      if (exists) {
        done();
      } else {
        mkdirp(self.settings.path, done);
      }
    });
  }

  function setup(done) {
    //open DBs
    // var path = self.settings.path,
    //     stateDB = null,// levelup(path + '/state'),
    //     blockDB = null,//levelup(path + '/block'),
    //     detailsDB = self.detailsDB = levelup(path + '/details');

    require("../test.js");
    //create the blockchain
    //self.blockchain = new Ethereum.Blockchain(blockDB, detailsDB);
    //create a VM
    //self.vm = new Ethereum.VM(stateDB);

    //start the blockchain. This will lookup last block on the blockchain.
    //self.blockchain.init(done);
  }

  //generates the genesis hash if needed
  function genesis(done) {
    var head = self.blockchain.head;

    if (!head) {
      //generate new genesis block
      self.vm.generateGenesis(function() {
        var block = new Ethereum.Block();
        block.header.stateRoot = self.vm.trie.root;
        log.info('state', 'root: ' + self.vm.trie.root.toString('hex'));
        log.info('state', 'genesis hash:' + block.hash().toString('hex'));
        log.info('rlp', block.serialize().toString('hex'));
        self.blockchain.addBlock(block, done);
      });
    } else {
      log.info('state', 'starting with state root of: ' + head.header.stateRoot.toString('hex') +
               ' height:' + head.header.number.toString('hex'));

      done();
    }
  }

  //get the unquie id of the client. If there isn't one then generate one
  function getId(done) {
    done(null, 0);
    // self.detailsDB.get('id', function(err, id) {
    //   if (!id) {
    //     var hash = crypto.createHash('sha512');
    //     hash.update((Math.random())
    //       .toString());

    //     id = hash.digest('hex');

    //     self.detailsDB.put('id', id, function(err) {
    //       done(err, id);
    //     });

    //   } else {
    //     done(err, id);
    //   }
    // });
  }

  var tasks = {
    checkPath: checkPath,
    setup: ['checkPath', setup],
    genesis: ['setup', genesis],
    ip: noop,
    upnp: noop,
    rcp: noop,
    id: ['setup', getId],
    network: ['ip', 'upnp', 'id', require('./networking.js').bind(self)]
  };

  if (this.settings.upnp) {
    tasks.ip = upnp.extrenalIp;
    tasks.upnp = async.apply(upnp.map, self.settings.network.port);
  }

  if (this.settings.rpc) {
    tasks.rpc = wsAPI.start.bind(self, this.settings.rpc);
  }

  //run everything
  async.auto(tasks, cb);
};

/**
 * Stops everything every
 * @method stop
 * @param {Function} cb calls this callback when everything is done
 */
App.prototype.stop = function(cb) {

  var self = this,
      tasks = [
        upnp.unmap,
        self.network.stop.bind(self.network)
      ];

  if (this.settings.rpc) {
    tasks.push(wsAPI.stop);
  }

  async.parallel(tasks, cb);

};


/**
 * Gets and serializes the entire block chain
 * @method getBlockChain
 * @param {Function} cb the callback is give an `Array` if blocks repsenting the
 * blockchain
 */
App.prototype.getBlockChain = function(cb) {

  var hash = this.blockchain.meta.genesis,
      height = this.blockchain.meta.height,
      self = this;

  this.blockchain.getBlockChain([hash], height, function(err, results) {
    //add the genesis block to the end of the results
    self.blockchain.getBlock(hash, function(err, genesis) {
      results.push(genesis);

      results = results.map(function(b) {
        return b.serialize(false);
      });

      cb(results);
    });
  });
};
