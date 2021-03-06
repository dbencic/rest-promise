#Rest promise class
ES6 Rest class for node **(not browser)**, wrapper arround request library with basic and more common used functionalities
##Example usage
```javascript
var RestPromise = require("rest-promise");
var url = "http://example.com/account/:accountId/otherArg/:myOtherArg";
var resource = new RestPromise(url);
var restPromise = resource
	.pathParams({accountId: 1, myOtherArg: "argValue"})	//params that will be replaced in url insted of placeholders
		.json()		//data will be sent and interpreted as json
		.requestData({var1: "value1", var2: "value2"}) 	//data that will be sent in query string or body, depending of method
		.log()				//request will be logged to console
		.timeout(10000) 	//requst will be timed out after 10 seconds (10.000 ms)
		.get();				//performs get method can be one of, .get(), post(), put(), delete() 

restPromise.then((responseBody)=>{
	console.log(responseBody);
}).catch(RestPromise.logAndRethrow);
```
Note: you dont have to set all params. In effect, invoking get(), post(), put() etc is the only thing you have to invoke
###RestPromise can be reused, for example
```javascript
var RestPromise = require("rest-promise");
var url = "http://example.com/account/:accountId";
var resource = new RestPromise(url, {accountId: 1}); //path params aplied immidiately and preserved for future use. 
													  //If you use .pathParams() method after this it wont have anny effect

resource.get().then((account)=>{
	account.touchedAt = new Date();
	return account;
}).then(resource.post).then(()=>{ 					//same resource will be resused
	console.log("Account touch timestamp updated");
}); 							

```
###Heders and cookies
Headers and cookies can be added following same builder method:
```javascript
var RestPromise = require("rest-promise");
var url = "http://example.com/account/:myPathParam";
var resource = new RestPromise(url, {myPathParam: "value"});
resource.header("User-Agent", "My app").header("Accept", "text/plain").header("Content-Type", "application/json");
resource.cookie("myCookie1", "myValueCookie1").cookie("myCookie2", "myCookieValue2");
resource.get((page)=>{
	console.log(page);
});
```
Note: after every request you must rebuild parameters/headers again.

###Basic authentication
Can be added via basicAuth builder method:
```javascript
var RestPromise = require("rest-promise");
var url = "http://example.com/account/:myPathParam";
var resource = new RestPromise(url, {myPathParam: "value"});
resource.basicAuth("someUser", "somePass").get((page)=>console.log(page));
```
Note: auth header is saved in rest promise instance, so as long you are using same instance you dont need to set it again.

###Cathcing errors
RestPromise class ships with one static method called 'logAndRethrow' which can be used as utility when catching errors. It simply logs error stack trace to console.error and then rethrows same error.
sample usage:
```javascript
var RestPromise = require("rest-promise");
var resource = new RestPromise(url);
resource.asJson().get().then((result)=>{
	console.log(result);
}).catch(RestPromise.logAndRethrow);
```
