

var tsession = {};
var sys = require('sys');
var bitcaps = {};

function listProperties(obj) {
   var propList = "";
   for(var propName in obj) {
      if(typeof(obj[propName]) != "undefined") {
         propList += (propName + ", ");
      }
   }
   sys.puts(propList);
}

var crypto=require("./node-crypto/crypto");

var node_twitteroauth = require('./node-twitteroauth');
// var foo = new node_twitteroauth.TwitterOAuth();
// listProperties(foo.options);
// var oauth_token = {};

var http = require("http");
http.createServer(function (req, res) {
  
  res.simpleHtml = function (code, body, extra_headers) {
    res.sendHeader(code, (extra_headers || []).concat(
	                       [ ["Content-Type", "text/html"],
                           ["Content-Length", body.length]
                         ]));
    res.sendBody(body);
    res.finish();
  };
  
  sys.puts("req.uri");
  sys.puts(req.uri.params);
  
  var oauth_token = req.uri.params["oauth_token"];
  if(oauth_token && tsession[oauth_token]){    
   var options = {
     oauth_token:tsession[oauth_token]["oauth_token"],
     oauth_token_secret:tsession[oauth_token]["oauth_token_secret"]
   };
   var twitterclient = new node_twitteroauth.TwitterOAuth(options);
   //we we have an oauth_token 
   twitterclient.accessToken().addCallback(function(data){
     //we have an accesstoken now, we do an authed request
     var options = {
       oauth_token: data[0][1],
       oauth_token_secret: data[1][1],
     };
     var twitterclient  = new node_twitteroauth.TwitterOAuth(options);
     twitterclient.verify().addCallback(function(data){
       res.simpleHtml(200, "oauth "+data);
     }).addErrback(function(err){
       res.simpleHtml(200, "oauth "+err);
     });
     //twitterclient .update("sent again from oauth-authorized client").addCallback(function(data){
     //  res.simpleHtml(200, "oauth "+data);
     //}).addErrback(function(err){
     //  res.simpleHtml(200, "oauth "+err);
     //});   
   }).addErrback(function(err){
     res.simpleHtml(200, "oauth "+err);
   });
  }else{    
   //we request the token first
   // add your application key and secret here;  
   var twitterclient = new node_twitteroauth.TwitterOAuth({consumerKey:"",consumerSecret:""});
   twitterclient.requestToken().addCallback(function(data){
     sys.puts('data[0][1]' + data[0][1]);
     sys.puts('data[1][1]' + data[1][1]);
     tsession[data[0][1]] = {};
     tsession[data[0][1]]["oauth_token"] = data[0][1];
     tsession[data[0][1]]["oauth_token_secret"] = data[1][1];
     res.simpleHtml(200,'<a href="http://twitter.com/oauth/authorize?oauth_token='+tsession[data[0][1]]["oauth_token"]+'">Login with twitter</a>');
   }).addErrback(function(err){
     res.simpleHtml(200, "oauth "+err);
   });
  }
  
  
  
  // response.sendHeader(200, {"Content-Type": "text/plain"});
  // response.sendBody("Hello World\n");
  // response.finish();
}).listen(8000);
sys.puts("Server running at http://127.0.0.1:8000/");


