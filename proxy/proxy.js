var http      = require('http');
var httpProxy = require('http-proxy');
var exec = require('child_process').exec;
var request = require("request");
var redis = require('redis');
var client = redis.createClient(6379, 'redis',{})

var TARGET = 'http://127.0.0.1:3000';
var START_PORT=3000

var infrastructure =
{
  setup: function()
  {
    // Proxy.
    var options = {};
    var proxy   = httpProxy.createProxyServer(options);
    var server  = http.createServer(function(req, res)
    {
      if(req.url == "/destroy")
      {
        client.lpop("serversList",function(err, src){
          var start = src.indexOf("t:")+2
          var PortID = src.substring(start,start+4) //"http://localhost:3000/"
          exec("forever list | grep '"+PortID+"' | awk -F '] ' '{print $2}' | awk -F ' ' '{print $1}'", function(err,out,code)
          {
            exec("forever stop "+ out, function(err,out,code){
              console.log("destroy server: "+ PortID.toString())
            });
          });
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.end("Destroy a server: http://localhost:"+ PortID.toString()+"/");
        })
      }
      if(req.url == "/")
      {
        console.log("hello")
        client.rpoplpush("serversList", "serversList", function(err, TARGET){
        console.log("Proxy now pointing to server:" + TARGET);
        proxy.web( req, res, {target: TARGET } );
        });
      }
      if (req.url == "/spawn")
      {
        exec('docker run -d -v /var/run/docker.sock:/var/run/docker.sock --link hw4_redis_1:redis hw4_app1',function(err,out,code)
        {
          console.log("attempting to launch a new container");
          if (err instanceof Error)
            throw err;
          if( err )
          {
            console.error( err );
          }
          // client.lpush("serversList","http://localhost:"+START_PORT.toString()+"/")
        });
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end("Created a new app container\n");
      }
      if(req.url == "/recent")
      {
        client.rpoplpush("serversList", "serversList", function(err, TARGET){
        console.log("Proxy now pointing to server:" + TARGET);
        proxy.web( req, res, {target: TARGET+"rencent" } );
        });
      }
      if(req.url == "/set")
      {
        client.rpoplpush("serversList", "serversList", function(err, TARGET){
        console.log("Proxy now pointing to server:" + TARGET);
        proxy.web( req, res, {target: TARGET+"set" } );
        });
      }
      if(req.url == "/get")
      {
        client.rpoplpush("serversList", "serversList", function(err, TARGET){
        console.log("Proxy now pointing to server:" + TARGET);
        proxy.web( req, res, {target: TARGET+"get" } );
        });
      }

      if(req.url == "/listservers")
      {
        var live_servers="The following servers are available: \n"
        client.lrange('serversList',0,-1,function(err,value){
        value.forEach(function(item){
        live_servers +="\n\t" +item.toString()})
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(live_servers)});
      }

    });
    server.listen(8081);

    // exec('forever start main.js 3000', function(err, out, code)
    // {
    //   client.del("serversList")
    //   client.lpush("serversList","http://localhost:3000/")
    //   console.log("attempting to launch  3000 server");
    //   if (err instanceof Error)
    //         throw err;
    //   if( err )
    //   {
    //     console.error( err );
    //   }
    // });
  },

  teardown: function()
  {
    exec('forever stopall', function()
    {
      console.log("infrastructure shutdown");
      process.exit();
    });
  },
}

infrastructure.setup();

// Make sure to clean up.
process.on('exit', function(){infrastructure.teardown();} );
process.on('SIGINT', function(){infrastructure.teardown();} );
process.on('uncaughtException', function(err){
  console.error(err);
  infrastructure.teardown();} );
