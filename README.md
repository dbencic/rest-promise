#Rest promise class
ES6 Rest class for node **(not browser)**, wrapper arround request library with very basic functionalities
##Example usage
```javascript
var url = "http://example.com/account/:accountId/otherArg/:myOtherArg";
var resource = new RestResource(url);
var restPromise = resource
	.pathParams({accountId: 1, myOtherArg: "argValue"})	//params that will be replaced in url insted of placeholders
		.asJson() 										//data will be sent and interpreted as json
		.requestData({var1: "value1", var2: "value2"}) 	//data that will be sent in query string or body, depending of method
		.log()											//request will be logged to console
		.timeout(10000) 								//requst will be timed out after 10 seconds (10.000 ms)
		.get();											//performs get method can be one of, .get(), post(), put(), delete() 

restPromise.then((responseBody)=>{
	console.log(responseBody);
}).catch((error)=>{
	console.trace(error);
});
```
Note: you dont have to set all params. In effect, invoking get(), post(), put() etc is the only thing you have to invoke
###RestResource can be reused, for example
```javascript
var url = "http://example.com/account/:accountId";
var resource = new RestResource(url, {accountId: 1}); //path params initialized immidiately

resource.get().then((account)=>{
	account.touchedAt = new Date();
	return account;
}).then(resource.post); 							//same resource will be resused

```