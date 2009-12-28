#Summary
This is an example of using node-twitteroauth in combination with other libraries of http://github.com/mediacoder.

This includes the following (but changed a bit)

- http://github.com/mediacoder/node-twitteroauth
- http://github.com/mediacoder/node-oauth
- http://github.com/waveto/node-crypto

## How to setup

* Login to your twitter, go to http://twitter.com/oauth_clients, and register your app.
* When register set "http://localhost.local:8000" as website and callback
* Get key and secret.
* Edit your 

  127.0.0.1       localhost.local

* Get this code
  
  git clone node-twitteroauth-test

* Edit test1/node-twitteroauth/test.js line 70 by adding key and secret you just added

  // add your application key and secret here;  
  var twitterclient = new node_twitteroauth.TwitterOAuth({consumerKey:"",consumerSecret:""});

* Start the server

 cd test1/node-twitteroauth
 node test.js
 
* hit http://localhost.local:8000

## License 

Please ask mediacoder. 