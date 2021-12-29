// THIS FILE CONTAINS AJAX FUNCTIONS ONLY FOR THE REASON JAVASCRIPT IMPORTS REFUSED TO WORK ON ME.
// THEY SHOULD BE IN THEIR OWN CLASS, SAFELY INSIDE Ajax.js
import {logIn} from "./Ajax.js";

var email;
var password;

/**
 * The URL the software contacts with HTTP methods
 * @type {string}
 */
var url = "http://localhost:63342/";

/**
 * Path after the URL which defines what route we want send the login request to
 * @type {string}
 */
var path = "loginUser";

/**
 * Register button - takes to register page
 * @author Julia Virtanen, Esa Ryömä
 */
document.getElementById('registerBtn').onclick = function goToRegister(){
    window.location = url + "register";
};


/**
 * Submit button - gathers email & password and sends it to backend
 * @author Julia Virtanen, Esa Ryömä
 */
document.getElementById('submit').onclick = function takeLogInInfo(){
    console.log('takeLogInInfo entered');
    email=document.getElementById('email').value;
    password=document.getElementById('password').value;
    takeResponse(email, password);

};

/**
 * Callback function to handle response from ajax request. Given as a parameter in logIn(params, path, myCallback)
 * @param result
 * @author Julia Virtanen, Esa Ryömä
 */
function myCallback(result) {
    console.log(result);
    if (result.success) {
        console.log('Success');
        window.location = url + 'app';
    } else {
        alert('Could not login: ' + result.message);
    }
}

/**
 * Forms the params from document email and password
 * @param email
 * @param password
 */
function takeResponse(email, password) {
    console.log('takeResponse entered: ' + email + password);
    var message = '';
    var params = {"email":email, "password":password};
    logIn(params, path, myCallback);

}


    /*
    if(response==true){
        //logIn()
        message='User logged in';
    }else{
        message='User or password is wrong';
    }
    return message;
}
*/


