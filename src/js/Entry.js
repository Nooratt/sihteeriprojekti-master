import React from 'react';
import '../css/event.css';
import {postToBackend} from "./Ajax";
import {withTranslation} from "react-i18next";
import Tooltip from "react-simple-tooltip";

let self;
let en, et, ed, tu, mu, hi;

/**
 * Class for the React component Entry
 *  - rendered when user is creating a new entry
 * @author Markus Ojajärvi, Julia Virtanen, Noora Turunen
 */
class Entry extends React.Component {
    constructor(props) {
        super(props);
        self = this;

        //Entry-Refs
        this.entryTab = React.createRef();
        this.entryName = React.createRef();
        this.entryDate = React.createRef();
        this.entryTime = React.createRef();
        this.entryTag = React.createRef();
        this.remindCheck = React.createRef();
        this.privateCheck = React.createRef();

        //Function bindings
        this.saveEntry = this.saveEntry.bind(this);
        this.myCallback=this.myCallback.bind(this);
    }
    render() {
        let date = this.formatDate(this.props.date);
        const { t, i18n } = this.props;
        return(
            <div id="Create_entry" className="tabcontent">
                <h1>{t('entry:title' )}</h1>
                <form>
                    <div className={"topnav"}>
                        <input type="text" ref={this.entryName} placeholder={t('entry:formtitle')} pattern=".{2,}" required/>
                        <br/><br/>
                        <p>{t('entry:date')}</p>
                        <input type="date" defaultValue={date} ref={this.entryDate} pattern=".{8,}"/>
                        <br/>
                        <p>{t('entry:time')}</p>
                        <input type="time" ref={this.entryTime} pattern=".{6,}"/>
                        <br/><br/>
                        {t('entry:remind')} <input type="checkbox" ref={this.remindCheck}/>
                        <br/>
                        {t('entry:private')} <input type="checkbox" ref={this.privateCheck}/>
                        <br/>
                        <input type="text" ref={this.entryTag} placeholder={t('entry:tag')} pattern=".{2,}"/>
                        <br/><br/><br/>
                        <button id="save" type="button" onClick={this.saveEntry}>{t('entry:save')}</button>
                    </div>
                </form>
            </div>
        )
    }

    /**
     * Runs all of the entry validation functions collectively
     * @author Julia Virtanen
     */
    runFunctions(){
        this.validateDate();
        this.validateEntryname();
        this.validateTime();
        this.validateTag();
        this.reminder();
        this.hiddenEntry();
    }

    /**
     * Function called to validate the input entry name
     * @author Julia Virtanen
     */
    validateEntryname(){
        var trimmedName = this.entryName.current.value.trim();
        if (this.entryName.current.validity.patternMismatch||trimmedName.length<=0) {
            alert("The name is invalid");
            en=0;
        }
        else {
            en = 1;
        }
        console.log(en);
    }

    /**
     * Function called to validate the input entry date
     * @author Julia Virtanen
     */
    validateDate(){
        var trimmedDate = this.entryDate.current.value.trim();
        if (this.entryDate.current.validity.patternMismatch||trimmedDate.length<=0) {
            alert("Date is invalid");
            ed=0;
        }
        else {
            ed = 1;
        }
        console.log(ed);
    }

    /**
     * Function called to validate the input entry time
     * @author Julia Virtanen
     */
    validateTime(){
        var trimmedTime = this.entryTime.current.value.trim();
        if (this.entryTime.current.validity.patternMismatch||trimmedTime.length<=0) {
            alert("Time is invalid");
            et=0;
        }
        else {
            et = 1;
        }
        console.log(et);
    }

    /**
     * Function called to validate the input entry tag
     * @author Julia Virtanen
     */
    validateTag(){
        if (this.entryTag.current.validity.patternMismatch) {
            alert("Tag is invalid");
            tu=0;
        }
        else {
            tu = 1;
        }
        console.log(tu);
    }

    /**
     * Function called to check the input reminder checkbox
     * @author Julia Virtanen
     */
    reminder() {
        if (this.remindCheck.current.checked === true){
            mu=1;
        }
        else {
            mu=0;
        }
        console.log(mu);

    }

    /**
     * Function called to check the input hidden entry checkbox
     * @author Julia Virtanen
     */
    hiddenEntry() {
        if (this.privateCheck.current.checked === true){
            hi=1;
        }
        else{
            hi=0;
        }
        console.log(hi);
    }

    /**
     * Function which fires when user submits the entry form
     * @author Julia Virtanen
     */
    saveEntry() {
        this.runFunctions();
        if ((tu===1) && (ed===1) && (et===1) && (en===1)){

            var time=this.entryDate.current.value+' '+this.entryTime.current.value+':00';
            console.log(time);
            var reminder=0;
            if(this.remindCheck.current.checked){
                reminder=1;
            }
            var params={name:this.entryName.current.value,date:this.entryDate.current.value,time:time,rem:reminder,cat:null};
            postToBackend(params,'entries',this.myCallback);

        }
        else {
            console.log(en,ed, et, tu);
            alert("There was a problem");
        }
    }

    /**
     * Function called to format the date to a specified string
     * @author Markus Ojajärvi
     * @param date: the date input
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

    /**
     * Callback function for the Ajax database request
     * @author Noora Turunen
     * @param result: the result of the saved entry
     */
    myCallback(result){
        console.log(result);
        alert("Entry added");
        let popup = document.getElementsByClassName("popup")[0];
        popup.style.display = "none";
    }

}
export default withTranslation()(Entry);
