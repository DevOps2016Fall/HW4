var redis = require('redis');
var multer  = require('multer');
var express = require('express');
var fs      = require('fs');
var http      = require('http');
var httpProxy = require('http-proxy');
var ip = require('ip')
var app = express();
var client = redis.createClient(6379, 'redis',{});
var serversList = {};
var args = process.argv.slice(2);
var PORT = 3000;

// REDIS
//var client = redis.createClient(6379, '127.0.0.1', {})

///////////// WEB ROUTES

// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next)
{
	console.log(req.method, req.url);
  client.lpush('_recent0',req.url);
  console.log('Time:', Date.now());
	next(); // Passing the request to the next handler in the stack.
});

app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   console.log(req.body); // form fields
   console.log(req.files); // form files

   if( req.files.image )
   {
	   fs.readFile( req.files.image.path, function (err, data) {
	  		if (err) throw err;
	  		var img = new Buffer(data).toString('base64');
	  		console.log(img);
	  		client.lpush("myimg",img);
		});
	}

   res.status(204).end();
}]);

app.get('/meow', function(req, res) {
		res.writeHead(200, {'content-type':'text/html'});
		client.lrange("myimg", 0, -1, function(error, items){
		if (error) throw error;
		if( items.length === 0 )
			res.write("<h1>\n the queue is empty!! </h1>");
			// res.end();
		items.forEach(function (imagedata)
		{
			client.lpop("myimg");
   			res.write("<h1>\n<img src='data:my_pic.jpg;base64," + imagedata + "'/>");
		});
		res.end();
	});

});

app.get('/', function(req, res) {
  res.send("Hello world from server :" + ip.address().tostring()+ " "+PORT.toString()+"/");
});

app.get('/recent',function(req,res){
	client.ltrim('_recent0',0,4);
	var send_ulrs="";
	client.lrange('_recent0',0,4,function(err,value){
		// console.log(value);
		value.forEach(function(item){
			send_ulrs +=" \n " +item.toString();
		});
	res.send(send_ulrs);});
});

app.get('/get',function(req,res){
	client.get('key', function(err,value){
		// console.log(value);
		res.send(value);
	});
	// res.send("sss");

});

app.get('/set',function(req,res){
	client.set('key','this message will self-destruct in 10 seconds');
	client.expire('key',20);
	res.send('setting key!');
});

app.get('/spawn/:portID',function(req,res){
	// serversList.push(createServers(req.params["portID"]))
	serversList[req.params["portID"]] = createServers(req.params["portID"])
	res.send(req.params);
});

app.get('/destroy',function(req,res){
	if (client.llen('serversList')===0){
		res.send("<h1>\n No server exists!'/>");
	}
	else{
    callLIndex(function(err, serverID) {
    // Use result here
    console.log(serverID);
    client.lrem('serversList',0, serverID);
    serversList[serverID].close();
    delete serversList[serverID];
    res.send("Server :"+serverID+" deleted!");
    });
	}
});

function callLIndex(callback) {
    /* ... do stuff ... */
		var index = Math.floor(Math.random()*Object.keys(serversList).length);
		console.log(index);
    client.lindex('serversList', index, function(err, result) {
        // If you need to process the result before "returning" it, do that here

        // Pass the result on to your callback
        callback(err, result);
    });
}

// app.get('/listservers',function(req,res){
// 	var live_servers="The available servers are listening on the following ports: \n"
// 	client.lrange('serversList',0,-1,function(err,value){
// 		// console.log(value);
// 		value.forEach(function(item){
// 			live_servers +="\n\t" +item.toString()
// 		})
// 	res.send(live_servers)});

// })


// HTTP SERVER
var server = app.listen(PORT, function () {
  client.del('_recent0');
  // client.del('serversList')
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

// function createServers(portID){
// 	var server1 = app.listen(parseInt(portID),function(){
// 	var host = server1.address().address
// 	var port = server1.address().port
// 	})
// 	console.log(portID)
// 	client.lpush("serversList","http://localhost:"+portID.toString()+"/")
// 	return server1
// }
