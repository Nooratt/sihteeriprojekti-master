// THIS FILE CONTAINS AJAX FUNCTIONS ONLY FOR THE REASON JAVASCRIPT IMPORTS REFUSED TO WORK ON ME.
// THEY SHOULD BE IN THEIR OWN CLASS, SAFELY INSIDE Ajax.js

var email;
var password;
var url = "http://localhost:63342/";
var path = "verifyUser";

// Functions for contacting backend methods
function Ajax() {


    this.ajaxFunction = function() { // adding a method to class Ajax
        var ajaxRequest;  // The variable that makes Ajax possible!

        try {
            // Opera 8.0+, Firefox, Safari
            ajaxRequest = new XMLHttpRequest();
            return ajaxRequest;
        } catch (e) {
            // Internet Explorer Browsers
            try {
                ajaxRequest = new ActiveXObject("Msxml2.XMLHTTP");
                return ajaxRequest;
            } catch (e) {
                try {
                    ajaxRequest = new ActiveXObject("Microsoft.XMLHTTP");
                    return ajaxRequest;
                } catch (e) {
                    // Something went wrong
                    alert("Your browser broke!");
                    return false;
                }
            }
        }
    };

    this.getFromBackend = function(params, path) { // adding a method to class Ajax
        // Called when sending data to backend through GET method
        // [params] is a {key:value} list object
        // [path] is the API path we want to send the request to, eg. "profile" including the slashes
        var ajaxRequest = this.ajaxFunction();
        if (ajaxRequest == false) {
            alert("Discontinued XMLHttpRequest");
        } else {
            // Create a function that will receive data sent from the server
            ajaxRequest.onreadystatechange = function () {
                console.log('entered .onReadyStateChange');
                switch (ajaxRequest.readyState) {
                    case 0:
                        //alert(ajaxRequest.responseText);
                        console.log("request not initialized ");
                        break;
                    case 1:
                        //alert(ajaxRequest.responseText);
                        console.log("server connection established");
                        break;
                    case 2:
                        //alert(ajaxRequest.responseText);
                        console.log("request received ");
                        break;
                    case 3:
                        //alert(ajaxRequest.responseText);
                        console.log("processing request");
                        break;
                    case 4:
                        alert(ajaxRequest.responseText);
                        console.log("request finished and response is ready");
                        break;
                }
            };

            // We send sensitive information (email, password) through the Basic Authorization header of a GET request
            // For basic authorization we need a string as username:password in Base64 encoding
            // Javascript function for encoding a string is btoa(string)
            // Javascript function for decoding a string is atob(string)

            var encoded = btoa(params.email + ":" + params.password);

            var header = "Basic " + encoded;
            console.log(header)
            // Send information to back end
            console.log(url + path);
            ajaxRequest.open("GET", url + path, true)
            ajaxRequest.setRequestHeader("Authorization", header);
            ajaxRequest.send();
        }


    }

}

var ajax = new Ajax();

var newNode = document.createElement('div');
// Get the reference node
var referenceNode = document.querySelector('#verifycheck');
// Insert the new node before the reference node
referenceNode.after(newNode);


document.getElementById('submit').onclick = function takeLogInInfo(){

    if (document.getElementById('verifycheck').checked) { // verify checkbox has been checked
        email=document.getElementById('email').value;
        password=document.getElementById('password').value;
        takeResponse(email, password);
    } else {

        newNode.innerText = "Please check this box to verify account";

    }


};

function takeResponse(email, password) {
    console.log('takeResponse entered: ' + email + password);
    var message = '';
    var params = {"email":email, "password":password};

    ajax.getFromBackend(params, path);



}