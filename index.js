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
		this.__initCallArgs();
	}

	__initCallArgs() {
		this.callArgs = {};
		this.callArgs.cookies = {};
		this.callArgs.headers = {};
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
		return this;
	}

	cookie(name, value) {
		this.callArgs.cookies[name] = value;
		return this;
	}

	header(name, value) {
		this.callArgs.headers[name] = value;
		return this;
	}

	authToken(authToken) {
		this.cookie("AuthToken", authToken);
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
		let url = this.callArgs.url || this.url;
		let methodHasBody = this.__hasBody(method);
		var options = {
		  url: url,
		  json: this.callArgs.json,
		  method: method,
		  body: (methodHasBody && this.callArgs.json)?this.callArgs.requestData:undefined,
		  form: (methodHasBody && !this.callArgs.json)?this.callArgs.requestData:undefined,
		  qs: (!methodHasBody)?this.callArgs.requestData:undefined,
		  timeout: this.callArgs.timeout || 300000,
		  headers: this._createHeaders()
		};
		if (this.callArgs.log) {
			console.log("Request options:");
			console.log(options);
		}

		let promise = new Promise((resolve, reject)=>{
			request(options, function(error, response, body){
				if (error) {
					console.error("access to resource request failed with error:");
					console.error(error.stack);
					reject(error);
				}else if(response.statusCode >= 400) {
					var error = new Error("Response Status Code " + response.statusCode + " considered as unsuccessfull.");
					console.error(error.stack);
					reject(error);
				}
				else {
					resolve(body);
				}
			});	
		});
		if (this.callArgs.res) {
			promise = promise.catch((error)=>{
				res.status(500).end(error.message);
			});
		}
		this.__initCallArgs();//resets call arguments
		return promise;
	}

	_createHeaders() {
		let headers = this.callArgs.headers;
		let cookies = Object.getOwnPropertyNames(this.callArgs.cookies).map((name)=>{
			return name + "=" + this.callArgs.cookies[name];
		});
		let headerCookie = Object.getOwnPropertyNames(headers).find((propertyName)=>/^cookie$/i.test(propertyName));
		if (headerCookie) {
			cookies.push(headers[headerCookie]);
			delete headers[headerCookie];
		}
		headers.Cookie = cookies.join("; ");
		return headers;
	}

	__hasBody(method) {
		return method=="POST" || method == "PUT" || method == "PATCH";
	}

}

module.exports = RestResource;