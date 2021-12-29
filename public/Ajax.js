import CookieHandler from './JwtAndCookies/CookieHandler';
const cookieHandler = new CookieHandler();
const url = "http://localhost:63342/";


/**
 * Creates a xmlHttpRequest object to handle requests.
 * @returns {XMLHttpRequest}
 */
let ajaxFunction = function() {
    let ajaxRequest;

    try{
        // Opera 8.0+, Firefox, Safari
        ajaxRequest = new XMLHttpRequest();
        return ajaxRequest;
    } catch (e){
        /*
        // Internet Explorer Browsers
        try{
            ajaxRequest = new ActiveXObject("Msxml2.XMLHTTP");
            return ajaxRequest;
        } catch (e) {
            try{
                ajaxRequest = new ActiveXObject("Microsoft.XMLHTTP");
                return ajaxRequest;
            } catch (e){
                // Something went wrong
                alert("Your browser broke!");
                return false;
            }
        }*/
    }
};

/**
 * An extracted function, which is used by the main functions in Ajax.js.
 * @param ajaxRequest: request object given so this function can see the response
 * @param callback: Callback function given from upper level to handle the response from backend
 */
let handleReadyStateChange = function(ajaxRequest, callback){
    switch (ajaxRequest.readyState) {
        case 0:
            //console.log("request not initialized ");
            break;
        case 1:
            //console.log("server connection established");
            break;
        case 2:
            //console.log("request received ");
            break;
        case 3:
            //console.log("processing request");
            break;
        case 4:
            //console.log("request finished and response is ready");
            //console.log(ajaxRequest.responseText);
            callback(ajaxRequest.responseText);
    }
};

/**
 * A specific function to handle the login process
 * @param params: Keyed List of email: 'email', password: 'password'
 * @param path: A string to come after 'domain.fi/'. In this case, needs to be 'profiles'.
 * @param callback: A callback function defined on an upper level: needs to handle the request response.
 */
let logIn = function(params, path, callback){

    let ajaxRequest = ajaxFunction();
    if (ajaxRequest == false) {
        alert("Discontinued XMLHttpRequest");
    } else {
        // Callback function that will receive data sent from the server
        ajaxRequest.onreadystatechange = () => {
            handleReadyStateChange(ajaxRequest, callback);
        };

        // We send sensitive information (email, password) through the Basic Authorization header of a GET request
        // For basic authorization we need a string as username:password in Base64 encoding
        // Javascript function for encoding a string is btoa(string)
        // Javascript function for decoding a string is atob(string)

        /**
         * Contains Base64 encoded where the source is in the form of user 'email:password'
         * @type {string}
         */
        let encoded = btoa(params.email+":"+params.password);

        /**
         * Authorization header which contains the keyword Basic followed by the Base64 encoded sequence of
         * user email:password
         * @type {string}
         */
        let header = "Basic "+encoded;
        console.log(header);
        // Send information to back end
        //console.log(url + path);
        ajaxRequest.open("GET", url + path, true);
        ajaxRequest.setRequestHeader("Authorization", header);
        ajaxRequest.send();
    }
};

/**
 * Called when sending data to backend through POST method
 * @param params: list object
 * @param path: String The API path we want to send the request to, eg. "profiles"
 */
let postToBackend = function(params, path, callback) {
    let ajaxRequest = ajaxFunction();
    if (ajaxRequest == false) {
        alert("Discontinued XMLHttpRequest");
    } else {
        // Create a function that will receive data sent from the server
        ajaxRequest.onreadystatechange = () => {
            handleReadyStateChange(ajaxRequest, callback);
        };

        // Send information to back end
        ajaxRequest.open("POST", url + path, true);
        ajaxRequest.setRequestHeader("Content-type", "application/json");
        ajaxRequest.send(JSON.stringify(params));
    }
};

/**
 * A function to send a get request without any additional parameters.
 * @param params: list object
 * @param callback: A callback function defined on an upper level: needs to handle the request response.
 */
let getWithoutParameters = function(path,callback){
    let ajaxRequest = ajaxFunction();
    if (ajaxRequest == false) {
        alert("Discontinued XMLHttpRequest");
    } else {
        // Create a function that will receive data sent from the server
        ajaxRequest.onreadystatechange = function () {
            handleReadyStateChange(ajaxRequest, callback);
        };

    }
    ajaxRequest.open("GET", url + path, true);
    ajaxRequest.setRequestHeader("Authorization", cookieHandler.getToken());
    ajaxRequest.send();

};


/**
 * Called when wanting to receive data from back end
 * Todo: functionality to work with URL route parameters http://domain.fi/:AccId
 * Todo: At the moment only works with query parameters http://domain.fi/?key=value&key2=value2 etc.
 * @param params: list object
 * @param path: String The API path we want to send the request to, eg. "profiles"
 * @param callback: A callback function (defined in the script calling this function. Will handle the result of the get query outside Ajax.js.
 */
let getFromBackend = function(params, path, callback) {
    let ajaxRequest = ajaxFunction();
    if (ajaxRequest == false) {
        alert("Discontinued XMLHttpRequest");
    } else {
        // Create a function that will receive data sent from the server
        ajaxRequest.onreadystatechange = () => {
            handleReadyStateChange(ajaxRequest, callback);
        };

        }

        // Send information to back end
        // Content-Type HTTP header should be set only for PUT and POST requests ?
        // Get requests can have accept headers https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.1
        // which tell the backend which kind of content the client (webpage) understage

        let queryString = "/?";
        let paramsKeys = Object.keys(params);
        console.log('Parametrien avaimet: ' + paramsKeys);
        for (let i = 0; i < paramsKeys.length; i++){
            // Add key=value text to queryString variable.
            queryString += paramsKeys[i] + "=" + params[paramsKeys[i]];

            if (paramsKeys[i+1] != null) { // there are more parameters to add
                queryString += "&";
            }
        }

        // should be "/?key=value&key=value"
        //console.log(url+path+queryString);
        //console.log('MoiccuKeksi on: ' + cookieHandler.getCookie("MoiccuKeksi"));

        // No MoiccuKeksi cookie found
        if(!cookieHandler.getCookie("MoiccuKeksi")) {
            console.log('Cookie ei löytynyt, lähetetään ILMAN auth headeria.');
            ajaxRequest.open("GET", url + path + queryString, true);
            ajaxRequest.send();
        } else {
            console.log('Cookie löytyi, lähetetään auth header.');
            ajaxRequest.open("GET", url + path + queryString, true);
            ajaxRequest.setRequestHeader("Authorization", "Bearer " + cookieHandler.getToken());
            ajaxRequest.send();
        }


};


/**
 * Update resources in backend
 * @param params: list object containing key:value pairs of updatable data
 * @param path: String The API path we want to send the request to, eg. "profiles"
 * @param callback: A callback function (defined in the script calling this function. Will handle the result of the get query outside Ajax.js.
 */
let updateBackend = function(params, path, callback) {
    let ajaxRequest = ajaxFunction();
    if (ajaxRequest == false) {
        alert("Discontinued XMLHttpRequest");
    } else {
        // Create a function that will receive data sent from the server
        ajaxRequest.onreadystatechange = function () {
            handleReadyStateChange(ajaxRequest, callback);
        };

    }

        // Send information to back end
        ajaxRequest.open("PUT", url + path, true);
        ajaxRequest.setRequestHeader("Content-type", "application/json");
        ajaxRequest.send(JSON.stringify(params));
    };

/**
 * Posts a picture to backend
 * @param params: list object containing key:value pairs
 * @param path: String The API path we want to send the request to, eg. "profiles"
 * @param callback: A callback function (defined in the script calling this function. Will handle the result of the get query outside Ajax.js.
 */
let postPic = function(params, path, callback) {
    let ajaxRequest = ajaxFunction();
    if (ajaxRequest == false) {
        alert("Discontinued XMLHttpRequest");
    } else {
        // Create a function that will receive data sent from the server
        ajaxRequest.onreadystatechange = () => {
            handleReadyStateChange(ajaxRequest, callback);
            }
        }

        // Send information to back end
        ajaxRequest.open("POST", url + path, true);
        ajaxRequest.setRequestHeader("Content-type", "multipart/form-data");
        ajaxRequest.send(params);
};


/**
 * Sends a DELETE request for a resource
 * @param params: list object containing key:value pairs
 * @param path: String The API path we want to send the request to, eg. "profiles"
 * @param callback: A callback function (defined in the script calling this function. Will handle the result of the get query outside Ajax.js.
 */
let deleteFromBackend = function(params, path, callback) {
    let ajaxRequest = ajaxFunction();
    if (ajaxRequest == false) {
        alert("Discontinued XMLHttpRequest");
    } else {
        // Create a function that will receive data sent from the server
        ajaxRequest.onreadystatechange = function () {
            handleReadyStateChange(ajaxRequest, callback);
        };

    }

    // Send information to back end
    ajaxRequest.open("DELETE", url + path, true);
    ajaxRequest.setRequestHeader("Content-type", "application/json");
    ajaxRequest.send(JSON.stringify(params));
};




export { postPic, logIn, postToBackend, getFromBackend, getWithoutParameters, updateBackend,deleteFromBackend };

