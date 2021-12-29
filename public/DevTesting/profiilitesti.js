import { getWithoutParameters, getFromBackend, postToBackend, logIn, updateBackend } from '../Ajax.js';
let profile;
let teksti;

// Profiili-update
document.getElementById('profiili').onclick = () => {
  let params = {
      name: "Petteri",
      lname: "Patterinen",
      email:"petteri.patterinen@gmail.com"};

  function myCallback(result){
      console.log(JSON.parse(result));
  }

  updateBackend(params, "profiles", myCallback)

};


// Hakutesti
document.getElementById('tekstiboksi').onkeyup = () => {
    let params = {
        searchString: document.getElementById('tekstiboksi').value
    };

    function myCallback(result) {
        //console.log(result);
        console.log(JSON.parse(result));

        //profile = JSON.parse(result);

    }
    getFromBackend(params, "profileSearch", myCallback);
};




// Post event
document.getElementById('button').onclick = function (){


    var params = {
      // name,sdate,edate,stime,etime,venue,info,pri,rep,accountId,cat,people
      name: "Pileet",
        sdate:"2019-03-31",
        edate:"2019-03-31",
        stime:"2019-03-31 18:00:00",
        etime:"2019-03-31 23:00:00",
        venue:"meikän kämppä",
        info:"mahtavat on juhlat",
        pri:3,
        rep:1,
        cat:null,
        people:[39,45]

    };

    /*
    var params = {
      email:"testi@mail.com"
    };
    */


    /* //yyyy-mm-dd
    var params = {
        sdate:"2019-01-31",
        edate:"2019-02-30"
    };
    */

    // Callback-funktio joka käsittelee getFromBackendin ja getWithoutParametersin tuloksen, kun sellainen saadaan.
    function myCallback(result){
        //console.log(result);
        console.log(result);

        //profile = JSON.parse(result);

    }
        postToBackend(params,"events",myCallback);
   // getFromBackend(params, "events", myCallback);
    //getWithoutParameters("profiles", myCallback);




};