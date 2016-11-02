var redis = require('redis')
var http      = require('http');
var httpProxy = require('http-proxy');
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var app = express()
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})
p = 3000
///////////// WEB ROUTES

// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next) 
{
	console.log(req.method, req.url);
	client.lpush('queue', req.url);
	
	next(); // Passing the request to the next handler in the stack.
});


app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
    //console.log(req.body) // form fields
    //console.log(req.files) // form files

    if( req.files.image )
    {
 	   fs.readFile( req.files.image.path, function (err, data) {
 	  		if (err) throw err;
 	  		var img = new Buffer(data).toString('base64');
 	  		//console.log(img);
			client.lpush('stack', img);
 		});
 	}

    res.status(204).end()
}]);

app.get('/meow', function(req, res) {
 	{
 		//if (err) throw err
 		res.writeHead(200, {'content-type':'text/html'});
		client.lrange('stack',0,0, function(err,reply) {
		
 		reply.forEach(function (imagedata) 
 		{
		//console.log(imagedata);
		
		res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+imagedata+"'/>");
	        console.log(req.headers.host)
		//res.end();
		});
		client.ltrim('stack',1,-1);
	res.end();
	});
    	
 	}
 })

app.get('/del',function(req,res) {
	client.del('servers'); 
    	res.send("Emptying list...Done");
})

app.get('/recent', function(req, res) {
		
	client.lrange('queue',0,4, function(err,reply) {
	res.send(reply);
	console.log(req.headers.host)
	});
        })

app.get('/set', function(req, res) {
	client.set("key", "this message will self-destruct in 10 seconds");
	client.expire("key",10);
	res.send("Key set...10 seconds countdown begins");
	console.log(req.headers.host)
	})

app.get('/get', function(req, res) {
	client.get("key",function(err,reply) {
	res.send(reply);
	console.log(req.headers.host)
	});
	
	})

//app.get('/set/:key', function(req, res) {
//        client.set("key", req.params.key);
//	client.expire("key",10)
//	res.send("trying to expire")
//        })

app.get('/', function(req, res) {
  res.send('hello world')
  console.log(req.headers.host)
})

//spawn a new server
app.get('/spawn', function(req,res) {
	p = p+1;
	var server = app.listen(p,function() {
		var host = server.address().address
		var port = server.address().port
		var url = "http://"+host+":"+port
		client.lpush('servers',url)
	console.log('New server created at http://%s:%s', host, port)
	res.send('New server created at '+url)
	})	
})

//list all servers
app.get('/listservers', function(req,res) {
client.lrange('servers',0,-1, function(err,reply) {
	res.send(reply);
	});
})

//destroy a random server from redis
app.get('/destroy', function(req,res) {
var index
client.llen('servers', function(err,reply) {
if(reply>1) {
index=Math.floor(Math.random()*reply)
//console.log('Removing index:'+reply)
client.lindex('servers',index, function(err,reply) {

client.lrem('servers',0,reply)
res.send('Removing:'+reply)
});
}
else {
res.send('Cannot destroy all servers')
} 
});

})

// HTTP SERVER
var server = app.listen(3000, function () {

   var host = server.address().address
   var port = server.address().port
   var url = "http://"+host+":"+port	
   client.lpush('servers',url)
 console.log('Example app listening at http://%s:%s', host, port)
 })

