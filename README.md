# HW3_Devops
Cache, Proxies, Queues
=========================

### Setup

* Clone this repo, run `npm install`.
* Install redis and run on localhost:6379

### A simple web server

Use [express](http://expressjs.com/) to install a simple web server.

	var server = app.listen(3000, function () {
	
	  var host = server.address().address
	  var port = server.address().port
	
	  console.log('Example app listening at http://%s:%s', host, port)
	})

Express uses the concept of routes to use pattern matching against requests and sending them to specific functions.  You can simply write back a response body.

	app.get('/', function(req, res) {
	  res.send('hello world')
	})

### Redis

You will be using [redis](http://redis.io/) to build some simple infrastructure components, using the [node-redis client](https://github.com/mranney/node_redis).

	var redis = require('redis')
	var client = redis.createClient(6379, '127.0.0.1', {})

In general, you can run all the redis commands in the following manner: client.CMD(args). For example:

	client.set("key", "value");
	client.get("key", function(err,value){ console.log(value)});

### TASK 1: An expiring cache

We are creating two routes, `/get` and `/set`.

When `/set` is visited, we are setting a new key, with the value:
> "this message will self-destruct in 10 seconds".

This key will self destruct in 10 seconds.
When `/get` is visited, we are fetching that key, and send value back to the client. 

### TASK 2: Recent visited sites

We are create a new route, `/recent`, which will display 5 most recently visited sites.


### TASK 3: Cat picture uploads: queue

We are implementing two routes, `/upload`, and `/meow` for uploading and displaying the pictures respectively.

### TASK 4: Spawning/destroying servers

Implemented a new command `spawn`, which will create a new app server running on another port. Correspondingly, implemented a new command `destroy`, which will destroy a random server. Available servers would be stored in redis, which can be seen by `listservers` command.

### TASK 5: Proxy

Created a proxy server which is running on port 8091. The job of the proxy server is to handle all requests and uniformly
load-balance across all the available servers. 
Run on separate terminals:

```
node proxy_server.js
node main.js 3000
```

