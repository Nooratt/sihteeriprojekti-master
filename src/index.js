import React from 'react';
import ReactDOM from 'react-dom';
import Tooltip from 'react-simple-tooltip';

// CSS imports
import './css/index.css';
import './css/icon.css';
import './css/popup.css';

// JS imports
import Settings from './js/Settings.js';
import Profile from './js/Profile.js';
import Event from './js/Event.js';
import Entry from './js/Entry.js'
import Note from './js/Note.js';
import CalendarDemo from "./js/CalendarDemo";
import TabMenu from './js/TabMenu';
import Groups from "./js/Groups.js";
import Help from "./js/Help";

// Import i18n containing translations and translation init configuration
// Not a ready module; this is hand-made.
import './js/i18n';
import {getFromBackend} from "./js/Ajax";
import {postToBackend} from "./js/Ajax";



// Variables
let profileClicked = false;
let groupClicked=false;
let popup = document.getElementsByClassName("popup")[0];
let tabs;

/**
 * Sets tabs with current date and renders calendar when window loads
 * @author Markus Ojajärvi
 */
window.onload = function() {
    // Render Default View

    tabs = {
        eventTab: <Event updateCalendar={updateCalendar} date={new Date()} editDate={editDate}/>,
        entryTab: <Entry updateCalendar={updateCalendar} date={new Date()} editDate={editDate}/>,
        noteTab: <Note updateCalendar={updateCalendar} date={new Date()} editDate={editDate}/>
    };

    ReactDOM.render(<CalendarDemo editDate={editDate} popup={<TabMenu defaultTab={tabs.eventTab} tab={tabs} locale={"en-GB"}/>}/>, document.getElementById('calendar'));
};

/**
 * Renders Profile component if profile or group isn't clicked or closes it if it is clicked
 * @author Markus Ojajärvi
 */
document.getElementById('iconProfile').onclick = function () {
    if (!profileClicked && !groupClicked) {
        profileClicked = true;
        ReactDOM.render(<Profile/>, document.getElementById('profile'));
    } else {
        profileClicked = false;
        groupClicked = false;
        ReactDOM.render(" ", document.getElementById('profile'));
    }
};

/**
 * Renders Groups component if profile or group isn't clicked or closes it if it is clicked
 * @author Noora Turunen
 */
document.getElementById('iconGroup').onclick = function () {
    if (!profileClicked && !groupClicked) {
        groupClicked = true;
        ReactDOM.render(<Groups callbackFromParent={myCallback}/>, document.getElementById('profile'));
    } else {
        profileClicked = false;
        groupClicked = false;
        ReactDOM.render(" ", document.getElementById('profile'));
    }
};

/**
 * Opens event tab when event icon is clicked
 * @author Markus Ojajärvi
 */
document.getElementById('iconEvent').onclick = function () {
    ReactDOM.render(<TabMenu defaultTab={tabs.eventTab} tab={tabs}/>, document.getElementById('popup-text'));
    popup.style.display = "block";
};

/**
 * Opens entry tab when entry icon is clicked
 * @author Markus Ojajärvi
 */
document.getElementById('iconEntry').onclick = function () {
    ReactDOM.render(<TabMenu defaultTab={tabs.entryTab} tab={tabs}/>, document.getElementById('popup-text'));
    popup.style.display = "block";
};

/**
 * Opens note tab when note icon is clicked
 * @author Noora Turunen
 */
document.getElementById('iconNote').onclick = function () {
    ReactDOM.render(<TabMenu defaultTab={tabs.noteTab} tab={tabs}/>, document.getElementById('popup-text'));
    popup.style.display = "block";
};

/**
 * Opens settings floppy when settings icon is clicked
 * @author Markus Ojajärvi
 */
document.getElementById('iconSettings').onclick = function () {
    ReactDOM.render(<Settings/>, document.getElementById('popup-text'));
    popup.style.display = "block";
};

/**
 * Opens help floppy when help icon is clicked
 * @author Julia Virtanen
 */
document.getElementById('iconHelp').onclick = function () {
    ReactDOM.render( <Help/>, document.getElementById('popup-text'));
    popup.style.display = "block";
    //settings.document();

};

/**
 * Closes any floppy that is currently open when close button is clicked
 * @author Markus Ojajärvi
 */
document.getElementsByClassName("close")[0].onclick = function () {
    ReactDOM.render(" ", document.getElementById('popup-text'));
    popup.style.display = "none";
};


/**
 * Opens event tab with clicked date when calendar date is clicked, sets dates for entry and note
 * @author Markus Ojajärvi
 * @param newDate:created new date
 */
function editDate(newDate) {
    tabs = {
        eventTab: <Event updateCalendar={updateCalendar} date={newDate}/>,
        entryTab: <Entry updateCalendar={updateCalendar} date={newDate}/>,
        noteTab: <Note updateCalendar={updateCalendar} date={newDate}/>
    };
    ReactDOM.render(<TabMenu defaultTab={tabs.eventTab} tab={tabs}/>, document.getElementById('popup-text'));
}

/**
 * Renders event tab according to data from back end sets ids and names as props
 * @author Noora Turunen
 * @param data:result from back end
 */
function myCallback(data){
    console.log(data);
    tabs.eventTab=<Event updateCalendar={updateCalendar} date={new Date()} ids={data.ids} names={data.names}/>;
    ReactDOM.render(<TabMenu  defaultTab={tabs.eventTab} tab={tabs}/>, document.getElementById('popup-text'));
    popup.style.display = "block";
}
document.getElementById("search").onkeyup=searchGuest;

/**
 * Searches people the user can add to contacts
 * @author Markus Ojajärvi
 * Inner function myCallback() gets result from search and shows it in list,
 * if list member is clicked the clicked user is added to contacts
 */
function searchGuest() {
    var search=document.getElementById("search").value.replace(/^\s+/g, '');
    let params = {
        searchString: search
    };
    let self=this;

    function myCallback(result) {
        var list = document.getElementById("searchList");

// As long as <ul> has a child node, remove it
        while (list.hasChildNodes()) {
            list.removeChild(list.firstChild);
        }
        let guests = JSON.parse(result);
        if(guests.length!==0){
            document.getElementById("dropdown").style.display = "inline-block";
            console.log(guests.length)
        } else {
            document.getElementById("dropdown").style.display = "none";
        }
        let guestChildren = [];

        for (var i = 0; i<guests.length; i++) {

            let name = guests[i].FirstName + " " + guests[i].LastName;
            let id = guests[i].ProID;
            //<p id={id} >{name}</p>
            guestChildren.push(name);
            var listItem=document.createElement("LI");
            listItem.innerHTML=name;
            listItem.id=id;
            listItem.onclick=function(){
                const params={contactId:this.id};
                postToBackend(params,'contacts',contactCallback)

            };
            document.getElementById("searchList").appendChild(listItem);
        }
        //document.getElementById("dropdown-content").innerHTML= guestChildren.toString();
    }
    if (params.searchString.length >= 2) {
        getFromBackend(params, "profileSearch", myCallback);
    } else {
        document.getElementById("dropdown").style.display = "none";
    }

};

/**
 * Gets result from contact adding, if successful clears search and tells that contact is added
 * @author Noora Turunen
 * @param result: true if contact is added
 */
function contactCallback(result){
    if(result){
        var list = document.getElementById("searchList");
        alert('New contact added');
        while (list.hasChildNodes()) {
            list.removeChild(list.firstChild);
        }
        document.getElementById("dropdown").style.display = "none";
        document.getElementById("search").value="";
    }else{
        alert('The person is already your contact');
    }

}

function updateCalendar(){

}


export {tabs, popup};
