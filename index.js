"use strict";
var request = require("request");

/**
 * aplies path params to URL and returns it
 */
function aplyPathParams(url, pathParams) {
    const keys = Object.getOwnPropertyNames(pathParams);
    keys.sort((k1, k2) => (k2.length - k1.length)); //sorts descending by length
    keys.forEach((key) => {
        url = url.replace(":" + key, pathParams[key]);
    });
    return url;
}

//RestResource
class RestResource {
    /**
     * @param url url arround which rest method will be invoked
     * @param pathParams params in path name-value pairs
     */
    constructor(url, pathParams) {
        if (!url) throw new Error("url (first param) is mandatory");
        this.__initCallArgs();
        this.callArgs.pathParams = pathParams || {};
        this.url = aplyPathParams(url, this.callArgs.pathParams);
        this.callLog = [];
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

    cookie(name, value) {
        this.callArgs.cookies[name] = value;
        return this;
    }

    header(name, value) {
        this.callArgs.headers[name] = value;
        return this;
    }

    basicAuth(username, password) {
        this.authorizationHeader =
            "Basic " + new Buffer(username + ":" + password).toString("base64");
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

    json() {
        return this.asJson();
    }

    timeout(timeout) {
        this.callArgs.timeout = timeout;
        return this;
    }

    log() {
        this.callArgs.log = true;
        return this;
    }

    get(queryStringParams) {
        if (queryStringParams) this.requestData(queryStringParams);
        return this.fetch("GET");
    }

    post(requestData) {
        if (requestData) this.requestData(requestData);
        return this.fetch("POST");
    }

    put(requestData) {
        if (requestData) this.requestData(requestData);
        return this.fetch("PUT");
    }

    delete() {
        return this.fetch("DELETE");
    }

    /**
     * returns opions for desired operation
     */
    getOptions(method) {
        const url = this.callArgs.url || this.url;
        const methodHasBody = this.__hasBody(method);
        var options = {
            url: url,
            json: this.callArgs.json,
            method: method,
            body: (methodHasBody && this.callArgs.json) ? this.callArgs.requestData : undefined,
            form: (methodHasBody && !this.callArgs.json) ? this.callArgs.requestData : undefined,
            qs: (!methodHasBody) ? this.callArgs.requestData : undefined,
            timeout: this.callArgs.timeout || 300000,
            headers: this._createHeaders()
        };
        return options;
    }

    /**
     * execution function
     */
    fetch(method, callbackWithErrorAndBodyArgs) {
        return new Promise((resolve, reject) => {
            this._doRequest(method, (error, body)=>{
                if (error) reject(error);
                else resolve(body);
                if (callbackWithErrorAndBodyArgs && (callbackWithErrorAndBodyArgs instanceof Function)) {
                    callbackWithErrorAndBodyArgs(error, body);
                }
            });
        });
    }

    _doRequest(method, callbackWithErrorAndBodyArgs) {
        var options = this.getOptions(method);
        var logOptions = Object.assign({}, options);
        logOptions.pathParams = this.callArgs.pathParams;
        if (this.callArgs.log) {
            console.log("Request options:");
            console.log(logOptions);
        }
        request(options, function(error, response, body) {
            if (error) {
                console.error("access to resource request failed with error:");
                console.error(error.stack);
            } else if (response.statusCode >= 400) {
                var error = new Error("Response Status Code " + response.statusCode + " considered as unsuccessfull. URL: "
                    + options.url + " [" + options.method + "]");
                console.error("Error calling url '%s'[%s]. Used options:", options.url, options.method);
                console.error(logOptions);
                console.error("Response body is: ", body);
                console.error(error.stack);
            }
            callbackWithErrorAndBodyArgs(error, body);
        });
        this.__initCallArgs(); //resets call arguments
    }

    _createHeaders() {
        const headers = this.callArgs.headers;
        const cookies = Object.getOwnPropertyNames(this.callArgs.cookies).map((name) => {
            return name + "=" + this.callArgs.cookies[name];
        });
        const headerCookie = Object.getOwnPropertyNames(headers).find((propertyName) => /^cookie$/i.test(propertyName));
        if (headerCookie) {
            cookies.push(headers[headerCookie]);
            delete headers[headerCookie];
        }
        headers.Cookie = cookies.join("; ");
        if (this.authorizationHeader) {
            headers["Authorization"] = this.authorizationHeader;
        }
        return headers;
    }

    __hasBody(method) {
        return method == "POST" || method == "PUT" || method == "PATCH";
    }

    /**
     * for usage in catch, to avoid typing same stuff again and again
     */
    static logAndRethrow(error) {

        if (error && error.stack) {
            console.error(error.stack);
        } else {
            console.log(error);
        }
        throw error;
    }

}

module.exports = RestResource;
