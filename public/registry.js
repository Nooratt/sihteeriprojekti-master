// THIS FILE CONTAINS AJAX FUNCTIONS ONLY FOR THE REASON JAVASCRIPT IMPORTS REFUSED TO WORK ON ME.
// THEY SHOULD BE IN THEIR OWN CLASS, SAFELY INSIDE Ajax.js
import {postToBackend} from "./Ajax.js";

var password = document.getElementById("password");
var pa;
var confirm_password = document.getElementById("confirm_password");
var copa;
var firstname = document.getElementById("fname");
var fna;
var lastname = document.getElementById("lname");
var lna;
var mail = document.getElementById("email");
var ai;
var url = "http://localhost:63342/";
var path = "profiles";

/**
 * Validate user input: first name
 *  @author Julia Virtanen
 */
function validateFname(){
    if (firstname.validity.patternMismatch) {
        alert("First name should be above 2 letters and not contain special characters")
        fna=0;
    }
    else{
        fna=1;
    }
}

/**
 * Validate user input: last name
 * @author Julia Virtanen
 */
function validateLname(){
    if (lastname.validity.patternMismatch) {
        alert("Last name should be above 2 letters and not contain special characters")
         lna=0;
    }
    else{
        lna=1;
    }
}

/**
 * Validate user input: email
 * @author Julia Virtanen
 */
function validateMail(){
    if (mail.validity.patternMismatch) {
        alert("Email should be valid email")
        ai=0;
    }
    else {
        ai=1;
    }
}

/**
 * * Validate user input: password matching and password quality
 * @author Julia Virtanen
 */
function validatePassword(){
    if(password.value != confirm_password.value || password.validity.patternMismatch ) {
        alert("Passwords don't match or it isn't good enough")
        pa=0;
        copa=0;
    }
    else{
        pa=1;
        copa=1;
    }
}

/**
 * Sends registering info to back end where new account is created,
 * inner function tells if adding was successful
 * @author Julia Virtanen
 */
function submitting() {
        // Load input from register form into variables
        var params = {
            FirstName: document.getElementById('fname').value,
            LastName: document.getElementById('lname').value,
            Email: document.getElementById('email').value,
            Password: document.getElementById('password').value

        };


        function myCallback(result){

            if (result) { // Registering was a success
                alert('Registering was a success. Please check your email for verification mail from info.moiccu@gmail.com');
                window.location = url;
            } else {
                alert('Registering was a failure')
            }
        }

        postToBackend(params, path, myCallback);



}

/**
 * Check that all validations are successful
 * @author Julia Virtanen
 */
function saveRegistry() {
    validateFname();
    validateLname();
    validateMail();
    validatePassword();

    if ((ai===1) && (lna===1) && (fna===1) && (copa===1)){
        alert("Text fields passed validation");
        // Call method to collect and submit data to backend
        submitting();

    }
    else {
        console.log(fna, lna, ai, copa);
        alert("One or more text fields didn't pass validation")
    }

}

// Chain of methods initiated when register page submit button is clicked
document.getElementById('button').onclick = () => {
    saveRegistry();
};