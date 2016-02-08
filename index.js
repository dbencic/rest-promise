"use strict";
var request = require("request");

/**
 * aplies path params to URL and returns it
 */
function aplyPathParams(url, pathParams) {
	Object.getOwnPropertyNames(pathParams).forEach((key)=>{
		url = url.replace(":" + key, pathParams[key]);
	});
	return url;
}

//RestResource
class RestResource {
	/**
	 * @param url url arround which rest method will be invoked
	 */
	constructor(url, pathParams) {
		this.url = aplyPathParams(url, pathParams || {});
		this.callArgs = {};

	}

	//args building 
	pathParams(pathParams) {
		pathParams = pathParams || {};
		this.callArgs.pathParams = pathParams;
		this.callArgs.url = aplyPathParams(this.url, pathParams);
		return this;
	}

	endResponseOnError(res) {
		this.callArgs.res = res;
	}

	authToken(authToken) {
		this.callArgs.authToken = authToken;
		return this;
	}

	requestData(requestData) {
		this.callArgs.requestData = requestData;
		return this;
	}

	asJson() {
		this.callArgs.json = true;
		return this;
	}

	timeout(timeout) {
		this.callArgs.timeout = timeout;
		return this;
	}

	log() {
		this.callArgs.log = true;
		return this;
	}

	get() {
		return this.doRequest("GET");
	}

	post(requestData) {
		if (requestData) this.requestData(requestData);
		return this.doRequest("POST");
	}

	put(requestData) {
		if (requestData) this.requestData(requestData);
		return this.doRequest("PUT");
	}

	delete() {
		return this.doRequest("DELETE");
	}

	/**
	 * execution function
	 */
	doRequest(method) {
		if (this.callArgs.log) {
			console.log("Executing method %s, on url:%s with args:", method, this.url);
			console.log(this.callArgs);
		}
		let url = this.callArgs.url || this.url;
		let methodHasBody = this.hasBody(method);
		var options = {
		  url: url,
		  json: this.callArgs.json,
		  method: method,
		  body: (methodHasBody)?this.callArgs.requestData:undefined,
		  qs: (!methodHasBody)?this.callArgs.requestData:undefined,
		  timeout: this.callArgs.timeout || 300000,
		  headers: {
		    'cookie': 'AuthToken=' + this.callArgs.authToken
		  }
		};

		let promise = new Promise((resolve, reject)=>{
			request(options, function(error, response, body){
				if (error) {
					console.log("access to resource request failed with error:");
					console.trace(error);
					reject(error);
				}else {
					resolve(body);
				}
			});	
		});
		if (this.callArgs.res) {
			promise = promise.catch((error)=>{
				res.status(500).end(error.message);
			});
		}
		this.callArgs = {};//resets call arguments
		return promise;
	}

	hasBody(method) {
		return method=="POST" || method == "PUT" || method == "PATCH";
	}

}

module.exports = RestResource;