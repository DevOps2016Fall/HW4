var http      = require('http');
var httpProxy = require('http-proxy');
var exec = require('child_process').exec;
var request = require("request");
var redis = require('redis');
var client = redis.createClient(6379, 'redis',{});



var TARGET = 'http://127.0.0.1:3000';
var START_PORT=3000;

var infrastructure =
{
  setup: function()
  {
    // Proxy.
    var options = {};
    var proxy   = httpProxy.createProxyServer(options);
    var server  = http.createServer(function(req, res)
    {

      if(req.url == "/")
      {
        client.rpoplpush("serversList", "serversList", function(err, TARGET){
        console.log("Proxy now pointing to server:" + TARGET);
        proxy.web( req, res, {target: TARGET } );
        });
      }
      if(req.url == "/listservers")
      {
        var live_servers="The following servers are available: \n";
        client.lrange('serversList',0,-1,function(err,value){
        value.forEach(function(item){
        live_servers +="\n\t" +item.toString()})
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(live_servers)})
      }

    });
    server.listen(8081);
  },

  teardown: function()
  {
    exec('forever stopall', function()
    {
      console.log("infrastructure shutdown");
      process.exit();
    });
  },
};

infrastructure.setup();

// Make sure to clean up.
process.on('exit', function(){infrastructure.teardown();} );
process.on('SIGINT', function(){infrastructure.teardown();} );
process.on('uncaughtException', function(err){
  console.error(err);
  infrastructure.teardown();} );
