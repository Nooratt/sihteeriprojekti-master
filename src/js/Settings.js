import React from 'react';
import '../css/settings.css';
import {withTranslation} from 'react-i18next';
import Tooltip from "react-simple-tooltip";
import {deleteFromBackend, getFromBackend, postToBackend, updateBackend} from "./Ajax";


let self;

/**
 * Class for the Settings React component
 * @author Julia Virtanen, Markus Ojajärvi, Noora Turunen
 */
class Settings extends React.Component{
    constructor(props) {
        super(props);
         self = this;


        //States
        this.state={
            tabToShow:'general',
            categoryList:[<option selected disabled value="">kikkelis</option>,
                         <option value="1">School</option>,
                        <option value="2">work</option>,
                        <option value="3">hobby</option>,
                        <option value="4">dog</option>],
             };


        //Setting-Refs
        this.profileAll=React.createRef();
        this.profileCon=React.createRef();
        this.profileNo=React.createRef();

        this.calendarAll=React.createRef();
        this.calendarCon=React.createRef();
        this.calendarNo=React.createRef();

        this.contactNo=React.createRef();
        this.contactApp=React.createRef();
        this.contactMail=React.createRef();

        this.groupNo=React.createRef();
        this.groupApp=React.createRef();
        this.groupMail=React.createRef();

        this.eventNo=React.createRef();
        this.eventApp=React.createRef();
        this.eventMail=React.createRef();

        this.responseNo=React.createRef();
        this.responseApp=React.createRef();
        this.responseMail=React.createRef();

        this.reminderNo=React.createRef();
        this.reminderApp=React.createRef();
        this.reminderMail=React.createRef();

        this.selectCategory=React.createRef();
        this.addCategory=React.createRef();

        /*
        <button className="tablinks" onClick={this.openSettings.bind(this, 'General')} id="defaultOpen">General</button>
        <button className="tablinks" onClick={this.openSettings.bind(this, 'Priv')}>Privacy</button>
        <button className="tablinks" onClick={this.openSettings.bind(this, 'Not')}>Notifications</button>*/

        //Function bindings
        this.openPrivacy=this.openPrivacy.bind(this);
        this.openGeneral=this.openGeneral.bind(this);
        this.openNotification=this.openNotification.bind(this);
        this.saveNotifications=this.saveNotifications.bind(this);
        this.savePrivacySettings=this.savePrivacySettings.bind(this);

    }
    render() {
        const {t, i18n} = this.props;

        if(this.state.tabToShow=='general'){
            return (
                <div className="tab">
                    <button className="tablinks" onClick={this.openGeneral} id="defaultOpen">{t('settings:tabtitleg')}</button>
                    <button className="tablinks" onClick={this.openPrivacy}>{t('settings:tabtitlep')}</button>
                    <button className="tablinks" onClick={this.openNotification}>{t('settings:tabtitlen')}</button>

                    <div id="General" className="tabcontent">

                        <h3>{t('settings:generalTitle')}</h3>
                        <p>
                            <h4>{t('settings:categoriesTitle')}</h4>
                            {t('settings:categoryDescription')}
                            <form>
                                <h5>{t('settings:deleteTitle')}</h5>
                                <select name="categories" id="categories" ref={this.selectCategory}>
                                    {this.state.categoryList}
                                </select>

                                <input type="button" value={t('settings:tabtitleg')} onClick={this.remove}/>

                                <h5>{t('settings:addTitle')}</h5>
                                <input type="text" id="kategoria" placeholder={t('settings:addPlaceholder')} pattern=".{2,}" ref={this.addCategory}/>
                                <input type="button" value="add" onClick={this.Add} />


                                <button onClick={() => i18n.changeLanguage('fi')}>fi</button><br/>
                                <button onClick={() => i18n.changeLanguage('en')}>en</button>

                                <input type="button" id="saveLang" value={t('settings:saveLanguage')} onClick={this.saveLang}/>
                            </form>
                        </p>
                    </div>

                </div>
            );
        }else if(this.state.tabToShow=='pri'){
            return(<div className="tab">
                <button className="tablinks" onClick={this.openGeneral} id="defaultOpen">{t('settings:tabtitleg')}</button>
                <button className="tablinks" onClick={this.openPrivacy}>{t('settings:tabtitlep')}</button>
                <button className="tablinks" onClick={this.openNotification}>{t('settings:tabtitlen')}</button>
                <div id="Priv" className="tabcontent">

                <h1>{t('settings:privacyTitle')}</h1>
                <p>{t('settings:privacyTitle')}</p>
                <h2>{t('settings:privacyDescription')}</h2>
                {t('settings:showProDescription')}
                <input type="radio" id="pall"
                       name="propri" value="all" ref={this.profileAll}/>
                <label htmlFor="pall">{t('settings:all')}</label>

                <input type="radio" id="pcont"
                       name="propri" value="cont" checked ref={this.profileCon}/>
                <label htmlFor="pcont">{t('settings:myContacts')}</label>

                <input type="radio" id="pno"
                       name="propri" value="no" ref={this.profileNo}/>
                <label htmlFor="pno">{t('settings:noOne')}</label>

                <br/>
                <h2>{t('settings:calendarTitle')}</h2>
                            {t('settings:showCalDescription')}
                <input type="radio" id="call"
                       name="calpri" value="all" ref={this.calendarAll}/>
                <label htmlFor="call">{t('settings:all')}</label>

                <input type="radio" id="ccont"
                       name="calpri" value="cont" checked ref={this.calendarCon}/>

                <label htmlFor="ccont">{t('settings:myContacts')}</label>

                <input type="radio" id="cno"
                       name="calpri" value="no" ref={this.calendarNo}/>
                <label htmlFor="cno">{t('settings:noOne')}</label>

                <br/>
                <input type="button" id="calprivacy" value={t('settings:saveChanges')} onClick={this.savePrivacySettings}/>
            </div>
            </div>);
        }else{
            return(<div className="tab">
                <button className="tablinks" onClick={this.openGeneral} id="defaultOpen">{t('settings:tabtitleg')}</button>
                <button className="tablinks" onClick={this.openPrivacy}>{t('settings:tabtitlep')}</button>
                <button className="tablinks" onClick={this.openNotification}>{t('settings:tabtitlen')}</button>
                <div id="Not" className="tabcontent">

                <h1>{t('settings:notificationTitle')}</h1>
                <p>
                                            {t('settings:contacts')}<br/>
                    <input type="radio" name="contacts" id="contactsN" value="Nothing" ref={this.contactNo}/> {t('settings:nothing')}<br/>
                    <input type="radio" name="contacts" id="contactsA" value="App" checked ref={this.contactApp}/>{t('settings:appNotification')}<br/>
                    <input type="radio" name="contacts" id="contactsM" value="Mail" ref={this.contactMail}/>{t('settings:email')}<br/>
                    <br/><br/>
                    Group invites<br/>
                    <input type="radio" name="gang" id="gangN" value="Nothing" ref={this.groupNo}/>{t('settings:nothing')}<br/>
                    <input type="radio" name="gang" id="gangA" value="App" checked ref={this.groupApp}/> {t('settings:appNotification')}<br/>
                    <input type="radio" name="gang" id="gangM" value="Mail" ref={this.groupMail}/>{t('settings:email')}<br/>
                    <br/><br/>
                    Event invites<br/>
                    <input type="radio" name="events" id="eventsN" value="Nothing" ref={this.eventNo}/> {t('settings:nothing')}<br/>
                    <input type="radio" name="events" id="eventsA" value="App" checked ref={this.eventApp}/> {t('settings:appNotification')}<br/>
                    <input type="radio" name="events" id="eventsM" value="Mail" ref={this.eventMail}/> {t('settings:email')}<br/>
                    <br/><br/>
                    Responses <br/>
                    <input type="radio" name="answers" id="answersN" value="Nothing" ref={this.responseNo}/> {t('settings:nothing')}<br/>
                    <input type="radio" name="answers" id="answersA" value="App" checked ref={this.responseApp}/> {t('settings:appNotification')}<br/>
                    <input type="radio" name="answers" id="answersM" value="Mail" ref={this.responseMail}/>{t('settings:email')}<br/>
                    <br/><br/>
                    Reminders<br/>
                    <input type="radio" name="memb" id="membN" value="Nothing" ref={this.reminderNo}/>{t('settings:nothing')}<br/>
                    <input type="radio" name="memb" id="membA" value="App" checked ref={this.reminderApp}/> {t('settings:appNotification')}<br/>
                    <input type="radio" name="memb" id="membM" value="Mail" ref={this.reminderMail}/> {t('settings:email')}<br/>

                    <input type="button" id="notifications" value={t('settings:saveChanges')}
                           onClick={this.saveNotifications}/>
                </p>
            </div>
            </div>);
        }
    }

    componentDidMount(){
        getFromBackend({},'category',this.categoryCallback);
    }

    /**
     * @author Noora Turunen
     * Function called by the Ajax database request
     * @param result: the result list of the categories
     */
    categoryCallback(result){
        var jresult=JSON.parse(result);
        let names=[];
        //console.log(jresult);

        jresult.forEach(function(result){

            names.push(<option value={result.Name}>{result.Name}</option>)

        });

        self.setState({categoryList:names});

    }

    /**
     * @author Noora Turunen
     * Function called when user changes the tab
     */
    openGeneral(){
        this.setState({tabToShow:'general'});
    }
    /**
     * @author Noora Turunen
     * Function called when user changes the tab
     */
    openPrivacy(){
        this.setState({tabToShow:'pri'});
    }
    /**
     * @author Noora Turunen
     * Function called when user changes the tab
     */
    openNotification(){
        this.setState({tabToShow:'not'});
    }

    /**
     * Function called to validate the input category name
     * @author Julia Virtanen
     * @returns {boolean}
     */
    validateCategory(){
        var trimmedName = self.addCategory.current.value.trim();
        if (self.addCategory.current.validity.patternMismatch||trimmedName.length<=0) {
            alert("Not a good name");
            return false;
        }
        else {
            return true;
        }
    }

    /**
     * @author Julia Virtanen, Noora Turunen
     * Function called to insert the category into the database
     */
    Add() {
        let valid=self.validateCategory();
        if(valid) {

            let name = self.addCategory.current.value;
            console.log(name);

            postToBackend({name: name}, 'category', self.addCallback);
        }
    };

    /**
     * Callback function fired from the Ajax database request method postToBackend
     * @param result: the saved category
     * @author Noora Turunen
     */
    addCallback(result){
        self.addCategory.current.value='';
        //console.log(result);
        self.componentDidMount();
        alert('new category added');
    }

    /**
     * Function called to remove a category from the database
     * @author Noora Turunen
     */
    remove() {
        var name=self.selectCategory.current.value;
        console.log(name);
        deleteFromBackend({name:name},'category',self.removeCallback);
        //var x = document.getElementById("categories");
        //x.remove(x.selectedIndex);
    }

    /**
     * Callback function fired from the Ajax database request method postToBackend
     * @param result: the removed category
     */
    removeCallback(result){
        console.log(result);
        alert('category removed');
        self.componentDidMount();
    }

    /**
     * Function called to check the notification settings of the user
     * @author Julia Virtanen
     * @returns {*}
     */
    contacts() {
        var connot;

        if (this.contactNo.current.checked) {
            connot=0;
        }
        else if (this.contactApp.current.checked){
            connot=1;
        }
        else if (this.contactMail.current.checked) {
            connot=2;
        }
        return connot;
    }

    /**
     * Function called to set the notification settings of the group
     * @author Julia Virtanen
     * @returns {*}
     */
    gangs() {
        var gang;

        if (this.groupNo.current.checked) {
            gang=0;
        }
        else if (this.groupApp.current.checked){
            gang=1;
        }
        else if (this.groupMail.current.checked) {
            gang=2;
        }
        return gang;
    }

    /**
     * Function called to set the notification settings for events
     * @author Julia Virtanen
     * @returns {*}
     */
    events() {
        var eve;

        if (this.eventNo.current.checked) {
            eve=0;
        }
        else if (this.eventApp.current.checked){
            eve=1;
        }
        else if (this.eventMail.current.checked) {
            eve=2;
        }
        return eve;
    }

    /**
     * Function called to set the notification settings for the invitations
     * @author Julia Virtanen
     * @returns {*}
     */
    answers() {
        var an;

        if (this.responseNo.current.checked) {
            an=0;
        }
        else if (this.responseApp.current.checked){
            an=1;
        }
        else if (this.responseMail.current.checked) {
            an=2;
        }
        return an;
    }

    /**
     * Function called to set the notification settings for the group invitations
     * @author Julia Virtanen
     * @returns {*}
     */
    membfunction() {
        var me;

        if (this.reminderNo.current.checked) {
            me=0;
        }
        else if (this.reminderApp.current.checked){
            me=1;
        }
        else if (this.reminderMail.current.checked) {
            me=2;
        }
        return me;
    }

    /**
     * Function called to save the language setting
     * @author Julia Virtanen
     */
    saveLang() {
        var kieli;

        if(document.getElementById('fin').checked) {
            kieli=1;
        }
        else if(document.getElementById('eng').checked) {
            kieli=0;
        }
        console.log(kieli)
    }

    /**
     * Function called to collectively run all the setting functions
     * @author Julia Virtanen
     */
    saveNotifications() {
        let con=this.contacts();
        let gan=this.gangs();
        let eve=this.events();
        let res=this.answers();
        let rem=this.membfunction();

        console.log(con,gan,eve,res,rem);
        let params={conNot:con,eveNot:eve,ganNot:gan,ansNot:res,remNot:rem};
        updateBackend(params,'notifications',this.notificationCallback);
    }

    /**
     * Function of the database request
     * @author Noora Turunen
     * @param result
     */
    notificationCallback(result){
        console.log(result);
        alert('updated');
    }

    /**
     * Function called to set the profile privacy setting
     * @author Julia Virtanen
     * @returns {number}
     */
    getProfilePrivacy(){
        if(this.profileAll.current.checked){
            return 0;
        }else if(this.profileCon.current.checked){
            return 1;
        }else if(this.profileNo.current.checked){
            return 2;
        }
    }

    /**
     * Function called to set the user's calendar privacy settings
     * @author Julia Virtanen
     * @returns {number}
     */
    getCalendarPrivacy(){
        if(this.calendarAll.current.checked){
            return 0;
        }else if(this.calendarCon.current.checked){
            return 1;
        }else if(this.calendarNo.current.checked){
            return 2;
        }
    }

    /**
     * Function called to save the user's privacy settings
     * @author Noora Turunen
     */
    savePrivacySettings(){
        let pro=this.getProfilePrivacy();
        let cal=this.getCalendarPrivacy();
        let params={pro:pro,cal:cal};
        updateBackend(params,'privacy',this.privacyCallback);
    }

    /**
     * Callback function of the Ajax database request
     * @param result: result of the privacy settings request
     */
    privacyCallback(result){
        console.log(result);
        alert('updated');
    }



}

export default withTranslation() (Settings);


