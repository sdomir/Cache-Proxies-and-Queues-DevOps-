var http      = require('http');
var httpProxy = require('http-proxy');
var redis = require('redis')

var client = redis.createClient(6379, '127.0.0.1', {}) 
var options = {};
    var proxy   = httpProxy.createProxyServer(options);

    var server  = http.createServer(function(req, res)
    {
      client.rpoplpush('servers','servers', function(err,reply) {
	console.log('Request handled by:'+reply)	
      proxy.web( req, res, {target: reply })
      
	});
    });
    server.listen(8091);
    console.log("Proxy server started at 8091")	
