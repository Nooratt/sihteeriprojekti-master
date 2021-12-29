class CookieHandler {
    constructor(){}

    setCookie(cookieName, cookieValue, expireDays) {
        var d = new Date();
        d.setTime(d.getTime() + (expireDays * 24 * 60 * 60 * 1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
    }

    getCookie(cookieName) {
        var name = cookieName + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    moiccuKeksiExists(){
        let cookie = this.getCookie("MoiccuKeksi");
        if (cookie){
            return true;
        } else {
            return false;
        }
    }

    jwtTokenExists(){
        let cookie = this.getCookie("MoiccuKeksi");
        if(cookie){
            cookie = decodeURIComponent(cookie);
            cookie = cookie.substr(2);
            cookie = JSON.parse(cookie);

            if (cookie.token){
                return true;
            } else {
                return false;
            }
        }
    }

    getToken() {
        let cookie = this.getCookie("MoiccuKeksi");
        // console.log('In getToken MoiccuKeksi is: ' + cookie);
        if(cookie){
            cookie = decodeURIComponent(cookie);
            cookie = cookie.substr(2);
            cookie = JSON.parse(cookie);

            if (cookie.token){
                // console.log(cookie.token);
                return cookie.token;
            } else {
                return null;
            }
        } else {
            return null;
        }

    };

}

export default CookieHandler;