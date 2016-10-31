var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var app = express()
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})

///////////// WEB ROUTES

// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next) 
{
	console.log(req.method, req.url);
	client.lpush('queue', req.url);
	

	next(); // Passing the request to the next handler in the stack.
});


app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
    console.log(req.body) // form fields
    console.log(req.files) // form files

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
		//res.end();
		});
		client.ltrim('stack',1,-1);
	res.end();
	});
    	
 	}
 })

app.get('/del',function(req,res) {
	client.del('stack'); 
    	res.send("Emptying list...Done");
})

app.get('/recent', function(req, res) {
		
	client.lrange('queue',0,4, function(err,reply) {
	res.send(reply);
	});
        })

app.get('/set', function(req, res) {
	client.set("key", "this message will self-destruct in 10 seconds");
	client.expire("key",10);
	res.send("Key set...10 seconds countdown begins");
	})

app.get('/get', function(req, res) {
	client.get("key",function(err,reply) {
	res.send(reply);
	});
	
	})

//app.get('/set/:key', function(req, res) {
//        client.set("key", req.params.key);
//	client.expire("key",10)
//	res.send("trying to expire")
//        })

app.get('/', function(req, res) {
  res.send('hello world')
})
// HTTP SERVER
 var server = app.listen(3000, function () {

   var host = server.address().address
   var port = server.address().port

 console.log('Example app listening at http://%s:%s', host, port)
 })

