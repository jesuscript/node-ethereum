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


level(process.env['HOME'] + '/.ethereum/node/details').get("meta", {
  valueEncoding: "json"
}, function(err, meta){
  console.log(err, meta);
});

