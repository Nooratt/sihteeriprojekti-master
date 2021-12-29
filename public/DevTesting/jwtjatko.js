// Cookie functions
import CookieHandler from './CookieHandler.js';
const cookieHandler = new CookieHandler();
import { getFromBackend, getWithoutParameters } from '../Ajax.js';


let cookie = cookieHandler.getCookie("MoiccuKeksi");
console.log(decodeURIComponent(cookie));
cookie = decodeURIComponent(cookie);
cookie = cookie.substr(2);
cookie = JSON.parse(cookie);
console.log(cookie);

function callback(result){
    console.log(result);
}

document.getElementById('button').onclick = () => {
    /* let decodedCookie = decodeURIComponent(cookie);
    console.log('Decoded cookie: ' + decodedCookie);
    let parsedCookie = JSON.parse(decodedCookie);
    console.log('Parsed cookie: ' + parsedCookie);
    let params = { email: decodedCookie.email };
    console.log(params);
    */


    getWithoutParameters('profiles', callback);


};