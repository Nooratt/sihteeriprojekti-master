import React from 'react';
import '../css/event.css';
import {getFromBackend, postToBackend} from "./Ajax";
import { withTranslation } from 'react-i18next';
import Tooltip from "react-simple-tooltip";
import CalendarDemo from "./CalendarDemo";

let self;
var eenn, eett, eedd;

/**
 * Class for React component Event
 *  - for creating new events
 *  @author Markus Ojajärvi, Julia Virtanen, Noora Turunen
 */
class Event extends React.Component {
    constructor(props) {
        super(props);
        if(this.props.names){
            this.state={
                guestInput:this.props.names,
                guestNames:[],
                guestIDs:this.props.ids,
            }
        }else{
            this.state = {
                guestNames: [],
                guestIDs: [],
                guestInput: []
            }};
        self = this;
        //Event-Refs
        this.eventTab = React.createRef();
        this.eventName = React.createRef();
        this.eventDate = React.createRef();
        this.eventStartTime = React.createRef();
        this.eventEndTime = React.createRef();
        this.guest = React.createRef();
        this.dropdown = React.createRef();
        this.dropdownContent = React.createRef();
        this.eventInfo=React.createRef();

        //Function bindings
        this.saveEvent = this.saveEvent.bind(this);
        this.searchGuest = this.searchGuest.bind(this);
        this.myCallback=this.myCallback.bind(this);
        this.inputGuests = this.inputGuests.bind(this);
        this.removeGuests = this.removeGuests.bind(this);
    }

    render() {
        const { t, i18n } = this.props;
        let date = this.formatDate(this.props.date);
        return(
                <div id="Create_event" className="tabcontent">
                    <h1>{t('event:title')}</h1>
                    <form>
                        <div className="topnav">
                            <input type="text" ref={this.eventName} pattern=".{2,}" required placeholder={t('event:formtitle')}/>
                            <br/><br/>
                            <h4>{t('event:date')}</h4>
                            <input type="date" defaultValue={date} ref={this.eventDate} required pattern=".{8,}"/>
                            <br/>
                            <h4>{t('event:timetime')}</h4>
                            <input type="time" ref={this.eventStartTime} required pattern=".{4,}"/>
                            <br/>
                            <h4>{t('event:endtime')}</h4>
                            <input type="time"  ref={this.eventEndTime}/>
                            <br/>
                            <h4>{t('event:description')}</h4>
                            <textarea id="description" rows="15" cols="50" ref={this.eventInfo}/>
                            <br/>
                            <h4>{t('event:category')}</h4>
                            <select name="kikkeliskokkelis" id="kiko" required>
                                <option value="1">Work</option>
                                <option value="2">Study</option>
                                <option value="3">Past time</option>
                                <option value="4">Other</option>
                            </select>
                            <br/>

                            <button id="save" type="button" onClick={this.saveEvent}>{t('event:save')}</button>
                        </div>
                        <div className="topnav">
                            <h4>{t('event:guests')}</h4>
                            <input type="text" ref={this.guest} onKeyUp={this.searchGuest} placeholder={t('event:attendees')}/>
                            <br/><br/><br/>
                            <div id={"dropdown"} ref={this.dropdown}>
                                <div id={"dropdown-content"} ref={this.dropdownContent}>{this.state.guestNames}</div>
                            </div>
                            <div id="list">{this.state.guestInput}</div>

                            <input type="text" ref={this.guest} onKeyUp={this.searchGuest} placeholder="Attendees"/>
                            <input type="button" id="add" onClick={this.guestlist} value="Invite"/>
                            <div id="list"> </div>
                        </div>
                    </form>
                </div>
        );
    }

    /**
     * Function which fires after a successful creating of Event
     * @author Noora Turunen
     * @param result: result from the Ajax database request
     */
    myCallback(result){
        console.log(result);
        let popup = document.getElementsByClassName("popup")[0];
        popup.style.display = "none";
        self.props.updateCalendar();
    }

    }


    /**
     * @author Julia Virtanen
     * Runs all the event validation functions collectively
     */
    runEventfunctions() {
        this.validateEDate();
        this.validateEventname();
        this.validateETime();
    }

    /**
     * @author Julia Virtanen, Noora Turunen
     * Function called when user submits the event form
     */
    saveEvent() {
        this.runEventfunctions();
        if ((eedd===1) && (eett===1) && (eenn===1)){
            var stime=this.eventDate.current.value+' '+this.eventStartTime.current.value+':00';
            console.log(stime);
            var etime=this.eventDate.current.value+' '+this.eventEndTime.current.value+':00';
            console.log(etime);
            var venue="place";
            var people=this.state.guestIDs;

            var params={name:this.eventName.current.value,sdate:this.eventDate.current.value,
                edate:this.eventDate.current.value,stime:stime,etime:etime,venue:venue,
                info:this.eventInfo.current.value,pri:1,rep:1,cat:null,people:people};
            postToBackend(params,'events',this.myCallback);
            eedd=0;
            eett=0;
            eenn=0;
        }
        else {
            console.log(eenn,eedd, eett);
            alert("Fail")
        }

    }

    /**
     * @author Julia Virtanen
     * Function called to validate event date input
     */
    validateEDate(){
        var trimmedDate = this.eventDate.current.value.trim();
        if (this.eventDate.current.validity.patternMismatch||trimmedDate.length<=0) {
            alert("Date is invalid");
            eedd=0;
        }
        else {
            eedd = 1;
        }
        console.log(eedd);
    }

    /**
     * @author Julia Virtanen
     * Function called to validate event name input
     */
    validateEventname(){
        var trimmedName = this.eventName.current.value.trim();
        if (this.eventName.current.validity.patternMismatch || trimmedName.length<=0) {
            alert("The name is invalid");
            eenn=0;
        }
        else {
            eenn = 1;
        }
        console.log(eenn);
    }

    /**
     * @author Julia Virtanen
     * Function called to validate event starting time input
     */
    validateETime(){
        var trimmedTime = this.eventStartTime.current.value.trim();
        if (this.eventStartTime.current.validity.patternMismatch||trimmedTime.length<=0) {
            alert("Starting time is invalid");
            eett=0;
        }
        else {
            eett = 1;
        }
        console.log(eett);
    }

    /**
     * @author Markus Ojajärvi
     * Function called to input invited users names to the component as children
     * @param name: name of the invited user
     * @param id: id of the invited user
     */
    inputGuests(name, id) {
        let guestInput = this.state.guestInput;
        let guestIDs = this.state.guestIDs;
        guestInput.push(<p onClick={(e) => this.removeGuests(e)} data-value={name} itemID={id}>{name}</p>);
        guestIDs.push(id);
        console.log(guestIDs);
        this.setState({
            guestInput: guestInput,
            guestIDs: guestIDs
        });
        self.dropdown.current.style.display = "none";
    }

    /**
     * @author Markus Ojajärvi
     * Function called to remove users from the guestlist
     * @param e: specifies the clicked user on the guestlist
     */
    removeGuests(e) {
        let item = e.target.getAttribute('itemID');
        let guestInput = this.state.guestInput;
        let guestIDs = this.state.guestIDs;
        guestInput.forEach(function (index) {
            console.log(index.props.itemID);
            if (index.props.itemID == item) {

                guestInput.splice(guestInput.indexOf(index), 1);
                guestIDs.splice(guestInput.indexOf(index), 1);
            }}
        );
        self.setState({
            guestInput: guestInput,
            guestIDs: guestIDs
        });
    }

    /**
     * @author Markus Ojajärvi
     * Function called on the searchbar input when user is adding guest to the guestlist
     */
    searchGuest() {
        let params = {
            searchString: this.guest.current.value.replace(/^\s+/g, '')
        };

        /**
         * Callback function for the Ajax database request
         * @author Markus Ojajärvi
         * @param result: the result of the database request (user IDs)
         */
        function myCallback(result) {
            let guests = JSON.parse(result);
            if(guests.length!==0){
                self.dropdown.current.style.display = "inline-block";
                console.log(guests.length)
            } else {
                self.dropdown.current.style.display = "none";
            }
            let guestChildren = [];

            for (var i = 0; i<guests.length; i++) {

                let name = guests[i].FirstName + " " + guests[i].LastName;
                let id = guests[i].ProID;
                guestChildren.push(<p onClick={() => {
                    self.inputGuests(name, id);
                    self.guest.current.value = "";
                }}>{name}</p>);
            }
            self.setState(() => ({guestNames: guestChildren.values()}));
        }
        if (params.searchString.length >= 2) {
            getFromBackend(params, "profileSearch", myCallback);
        } else {
            self.dropdown.current.style.display = "none";
        }

    };


    /**
     * Function called to format the the date to a specified string
     * @author Markus Ojajärvi
     * @param date
     * @returns {string}
     */
    formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

}

export default withTranslation()(Event);
