function listProperties(obj) {
   var propList = "";
   for(var propName in obj) {
      if(typeof(obj[propName]) != "undefined") {
         propList += (propName + ", ");
      }
   }
   sys.puts(propList);
}

var bitcaps = {};
bitcaps.util = {}
// sys.puts("UTIL LOADED");

bitcaps.util.Class = {
	create:function(){
		function klass() {
			this.initialize.apply(this, arguments);
		}

		klass.prototype.constructor = klass;

    		return klass;
	}
}

bitcaps.util.BaseWidget = {
	initialize:function() {
		this.observables = [];
		var defaultOpts = bitcaps.util.extend(this.defaultOptions(), { 
			hiddenByDefault: false,
			register:true
		});
		this.options = bitcaps.util.extend(defaultOpts, arguments[0] || {});
 		if (this.setup != undefined) {
			this.setup();
		}
    		this.content = "";
	},
	getName:function(){
		return self.name;
	}
};


bitcaps.util.extend = function(dest, src,init) {
	if(init==null){
		init = false;
	}
	for(prop in src) {
		if (prop == "__initializer") {
		if (!dest.__initializers) dest.__initializers = []
			dest.__initializers.push(src[prop])
		}else {
			dest[prop] = src[prop];
		}
	}
	if (!dest.init && init) {
		dest.init = function() {
			for (var i=0; i < this.__initializers.length; i++) {
				this.__initializers[i].apply(this)
			};
		}
	}
	return dest;
};

//  The above taken from http://pastie.org/757991
//  Thanks to http://github.com/mediacoder



var http = require('http');
var sys = require('sys');
var oauth = require('./oauth/node-oauth/node-oauth').OAuth;

var TwitterOAuthClient = function(options){

	this.options = options || {consumerKey:"",consumerSecret:""}
	this.consumer = {};
	this.clients = {};
	this.oauthtoken = "";

	this.consumer.twitter = {
		consumerKey   : this.options.consumerKey, 
		consumerSecret: this.options.consumerSecret, 
		serviceProvider:{ 
			signatureMethod     : "HMAC-SHA1", 
				requestTokenURL     : "http://twitter.com/oauth/request_token", 
				userAuthorizationURL: "http://twitter.com/oauth/authorize", 
				accessTokenURL      : "http://twitter.com/oauth/access_token"
			}
	};		

	if(this.options != null){
		this.oauth_token_secret = this.options.oauth_token_secret;
		this.oauth_token = this.options.oauth_token
		this.tokens = {oauth_token:this.oauth_token,oauth_token_secret:this.oauth_token_secret};
		this.consumer.twitter.consumerKey = this.options.consumerKey;
		this.consumer.twitter.consumerSecret =  this.options.consumerSecret;		
	}

	this.accessor = this.consumer.twitter;
};

TwitterOAuthClient.prototype.requestToken = function(){
	var promise = new process.Promise;
	var message = {
		method: "post", 
		action: this.accessor.serviceProvider.requestTokenURL, 
		parameters: {
			oauth_signature_method:this.accessor.signatureMethod,
			oauth_signature:"",
			oauth_token:"",
			oauth_consumer_key:this.accessor.consumerKey
		}
	};
	oauth.completeRequest(message, this.accessor);
	var body = oauth.formEncode(oauth.getParameterMap(message.parameters));
	return this.sendRequest("post","/oauth/request_token",body,promise,null)
};
TwitterOAuthClient.prototype.authorizeRequest = function(tokens){
	var message = {method: "post", action: this.accessor.serviceProvider.accessTokenURL};
	oauth.completeRequest(message,{
	consumerKey:this.accessor.consumerKey, 
		consumerSecret: this.accessor.consumerSecret, 
		token: oauth.getParameter(tokens, "oauth_token"), 
		tokenSecret: oauth.getParameter(tokens, "oauth_token_secret")
	});
	this.tokens = tokens;
	return this.getAuthorizeURL(this.tokens["oauth_token"]);
};
TwitterOAuthClient.prototype.accessToken = function(){
	var promise = new process.Promise;
	var message = {method: "post", action: this.accessor.serviceProvider.accessTokenURL};
	oauth.completeRequest(message,{
		consumerKey:this.accessor.consumerKey, 
		consumerSecret: this.accessor.consumerSecret, 
		token: this.tokens.oauth_token, 
		tokenSecret: this.tokens.oauth_token_secret
	});
	var body = oauth.formEncode(oauth.getParameterMap(message.parameters));
	return this.sendRequest("post","/oauth/access_token","",promise,{"authorization":oauth.getAuthorizationHeader("", message.parameters)});	
};	
TwitterOAuthClient.prototype.getAuthorizeURL = function(){
	return this.getURL(this.tokens.oauth_token)
};
TwitterOAuthClient.prototype.update = function(msg){
	var promise = new process.Promise;
	var message = {method: "post", action: "http://twitter.com/statuses/update.json",parameters: [["status",msg]]};
	oauth.completeRequest(message,{
		consumerKey:this.accessor.consumerKey, 
		consumerSecret: this.accessor.consumerSecret, 
		token: this.tokens.oauth_token, 
		tokenSecret: this.tokens.oauth_token_secret
	});
	var body = "status="+msg;
	return this.sendRequest(message.method,"/statuses/update.json",body,promise,{"authorization":oauth.getAuthorizationHeader("", message.parameters)},function(data){return data;});
};
TwitterOAuthClient.prototype.verify = function(){
	var promise = new process.Promise;
	var message = {method: "get", action: "http://twitter.com/account/verify_credentials.json",parameters: []};
	oauth.completeRequest(message,{
		consumerKey:this.accessor.consumerKey, 
		consumerSecret: this.accessor.consumerSecret, 
		token: this.tokens.oauth_token, 
		tokenSecret: this.tokens.oauth_token_secret
	});
	
	sys.puts("message.parameters:::" + message.parameters);
	
	return this.sendRequest(message.method,"/account/verify_credentials.json","",promise,{"authorization":oauth.getAuthorizationHeader("", message.parameters)},function(data){return data;});	
};
TwitterOAuthClient.prototype.getURL = function(token) {
	return "http://twitter.com/oauth/authorize" +"?oauth_token=" + token;
};
TwitterOAuthClient.prototype.parseTokens = function(body){
	var results = [];
	if(body.match(/oauth_token=/) != -1){
		results = oauth.decodeForm(body);
		return results;
	}
};
TwitterOAuthClient.prototype.sendRequest = function(method,url,body,promise,h,c){
	var headers = {
		"host":"twitter.com",
		"accept":"*/*"
	};
	if(h != null){
		headers = bitcaps.util.extend(headers,h);
	}
	var self = this;
	if(c == null){
		var c = function(data){
			return self.parseTokens(data);
		}
	}
	if(method == "post"){
		headers = bitcaps.util.extend(headers,{
			"content-length":body.length,
			"content-type":"application/x-www-form-urlencoded"
		});
	}
	var req = this.getClient(80, "twitter.com").request(method.toUpperCase(),url, headers);
	
	if(body.length > 0){
		req.sendBody(body);
	}
	
	req.finish(function (response) {
		var body = "";
		response.setBodyEncoding("utf8");
		response.addListener("body", function (chunk) {
			body += chunk;
		});
		response.addListener("complete", function (chunk) {
			sys.puts("BODY--->"+body);
			if(response.statusCode == "200"){
				var res = c(body);
				//c(res);
				promise.emitSuccess(res);
			}else{
				promise.emitError(body);
			}
		});
	});
	sys.puts(req);
	return promise;
};
TwitterOAuthClient.prototype.getClient = function(port, host) {
	var key = [port, host];
	var client = this.clients[key];
	if (client) {
		return client;
	} else {
	  
		this.clients[key] = http.createClient(port, host);
		listProperties(this.clients[key]);
		return this.clients[key]
	}
};

exports.TwitterOAuth = TwitterOAuthClient;
