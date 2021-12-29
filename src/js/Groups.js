import React from 'react';
import '../css/group.css';
import { withTranslation } from 'react-i18next';
import {getFromBackend, postToBackend} from "./Ajax";
import Tooltip from "react-simple-tooltip";


/**
 * Class for the Groups component
 * @author Noora Turunen
 * @class Groups
 */
class Groups extends React.Component{
    constructor(props) {
        super(props);
        this.groupSection=React.createRef();
        this.groupName=React.createRef();
        this.dropdown=React.createRef();
        this.dropdownContent=React.createRef();
        this.guest=React.createRef();
        this.state = {
            showGroupList:true,
            groupList:[],
            groupIds:[],
            membersList:[],
            memberNames:[],
            memberInput:[],
            guestIDs:[],
            touchedGroup: null,
            touchedIDs:[],
            contactList:[],

        };
        this.myCallback = this.myCallback.bind(this);
        this.showMembers=this.showMembers.bind(this);
        this.myMemberCallback=this.myMemberCallback.bind(this);
        this.addGroup=this.addGroup.bind(this);
        this.saveGroup=this.saveGroup.bind(this);
        this.searchGuest=this.searchGuest.bind(this);
        this.cancel=this.cancel.bind(this);
        this.myGroupAddCallback=this.myGroupAddCallback.bind(this);
        this.addGroupEvent=this.addGroupEvent.bind(this);
        this.contactCallback=this.contactCallback.bind(this);
    }


    render() {
        const {t, i18n} = this.props;
        if(this.state.showGroupList){
            return (
                <article id="groupSection" ref={this.groupSection}>
                    <h1 id={"groups"} >{t('groups:groupTitle')}</h1>
                    <div id="grouplist">{this.state.groupList}</div>

                    <br/>
                    <button id={"addGroup"} onClick={this.addGroup}>{t('groups:addGroupTitle')}</button>
                    <br/>
                    <br/>
                    <div id={"selectedSection"} >
                        <div id={"touchedGroup"}>{t('groups:members')}</div>
                        <div id={"memberList"}>{this.state.membersList}</div>
                        <button id={"addGroupEvent"} onClick={this.addGroupEvent}>{t('groups:addEventButton')}</button>
                    </div>
                    <h1 id={"Contacts"} >{t('groups:contactTitle')}</h1>
                    <div id="contactlist">{this.state.contactList}</div>

                </article>
            )

        }else{
            return(
                <article id={"groupSection"} ref={this.groupSection}>
                    <h1 id={"addGroupHeader"}>{t('groups:addGroupTitle')}</h1>
                    <p>{t('groups:groupName')}</p>
                    <input type="text" ref={this.groupName} pattern=".{2,}" required placeholder={t('groups:groupNamePlaceholder')}/>
                    <br/><br/>
                    <p>{t('groups:searchUsersTitle')}</p>
                    <input type="text" ref={this.guest} onKeyUp={this.searchGuest} placeholder={t('groups:userSearchPlaceholder')}/>
                    <br/><br/><br/>
                    <div id={"dropdown"} ref={this.dropdown}>
                        <div id={"dropdown-content"} ref={this.dropdownContent}>{this.state.memberNames}</div>
                    </div>
                    <div id="list" >{this.state.memberInput}</div>
                    <br/>
                    <button id="save" type="button" onClick={this.saveGroup}>{t('groups:saveButton')}</button>
                    <button id="cancel" type="button" onClick={this.cancel}>{t('groups:cancelButton')}</button>

                </article>
            )
        }
    }
    componentDidMount(){
        getFromBackend({},'groups',this.myCallback);
        getFromBackend({},'contacts',this.contactCallback);

    }

    /**
     * Gets group results from back end and sets states accordingly
     * @author Noora Turunen
     * @param result: groups list from back end
     */
    async myCallback(result){
        //var GroupObject={name:'kaikkienGang',people:[2,3]};
        console.log(result);
        var jresult=JSON.parse(result);
        console.log(jresult);
        let names=[];
        let ids=[];
        var self=this;
        jresult.forEach(function(result){
            names.push( <p data-value={result.GangName} id={result.GanID} onClick={(e)=>self.showMembers(e)}>
                {result.GangName}</p>);
            ids.push(result.GanID);
        });
        await this.setState({groupList:names});
        this.setState({groupIds:ids});
    }

    /**
     * Gets results of the contacts and sets them as contactList state
     * @author Noora Turunen
     * @param result: contact list from back end
     */
    async contactCallback(result){
        var jresult=JSON.parse(result);
        let names=[];
        jresult.forEach(function(result){
            names.push( <p data-value={result.FirstName+' '+result.LastName} id={result.accountAccID} >
                {result.FirstName+' '+result.LastName}</p>);
        });
        await this.setState({contactList:names});

    }

    /**
     * Gets clicking event and according to its target retrieves the group members
     * @author Noora Turunen
     * @param e: clicking event, for getting the target
     */
    showMembers(e){
        let elementid=e.target.id;
        this.setState({touchedGroup:elementid});
        console.log(elementid);
        getFromBackend({GanID:elementid},'members',this.myMemberCallback);
    }

    /**
     * Gets list of the member results from back end and sets states
     * @author Noora Turunen
     * @param result: List of group members
     */
    myMemberCallback(result){
        var jresult=JSON.parse(result);
        let names=[];
        let ids=[];

        jresult.forEach(function(result){
           // names.push(result.FirstName +' '+result.LastName);
            names.push(<div>{result.FirstName+' '+result.LastName}</div>)
            ids.push(result.accountAccID);
        });

        this.setState({membersList:names});
        this.setState({touchedIDs:ids});
    }

    /**
     * Changes to group adding view
     * @author Noora Turunen
     */
    addGroup(){
        this.setState({showGroupList:false});
    }

    /**
     * Checks if given group name is valid
     * @author Noora Turunen
     * @return boolean:true if name is valid
     */
    validateName(){
        var trimmedName = this.groupName.current.value.trim();
        if (this.groupName.current.validity.patternMismatch||trimmedName.length<=0) {
            alert("Group must have a name");
            return false;
        }
        else {
            return true;
        }
    }

    /**
     * Checks if one or more people are added to group
     * @author Noora Turunen
     * @return boolean:true if there is one or more people
     */
    validateGroup(){
        if(this.state.guestIDs.length<1){
            alert("Add one or more moiccu. people to group");
            return false;
        }else{
            return true;
        }
    }

    /**
     * Checks if given group data is valid
     * @author Noora Turunen
     * @return boolean:true if data is valid
     */
    runValidations(){
        var name=this.validateName();
        var people=this.validateGroup();
        if(name&&people){
            return true;
        }else{
            return false;
        }
    }

    /**
     * If group data is valid, sends group to back end
     * @author Noora Turunen
     */
    saveGroup(){
        var valid=this.runValidations();
        if(valid) {
            var GroupObject = {name: this.groupName.current.value, people: this.state.guestIDs};
            console.log(JSON.stringify(GroupObject));
            postToBackend({GroupObject}, 'groups', this.myGroupAddCallback);
        }

    }

    /**
     * Changes back to normal group view
     * @author Noora Turunen
     */
    cancel(){
        this.setState({showGroupList:true,
            memberInput:[],
            guestIDs:[]});
    }

    /**
     * Gets results of group adding from back end and sets states
     * @author Noora Turunen
     */
    myGroupAddCallback(result){
        console.log(result);
        alert('New group added');
        this.setState({showGroupList:true,
            memberInput:[],
            guestIDs:[]});
        this.componentDidMount();
    }

    /**
     * Searches members the user can add to group
     * @author Noora Turunen
     * Inner function myCallback gets result from search and shows it in list
     */
    searchGuest() {
        let params = {
            searchString: this.guest.current.value.replace(/^\s+/g, '')
        };
        let self=this;

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
            self.setState(() => ({memberNames: guestChildren.values()}));
        }
        if (params.searchString.length >= 2) {
            getFromBackend(params, "profileSearch", myCallback);
        } else {
            self.dropdown.current.style.display = "none";
        }

    };

    /**
     * Adds search result to member list when result is clicked
     * @author Noora Turunen
     * @param name: users name for member list
     * @param id: users id for member lists id
     */
    inputGuests(name, id) {
        let guestInput = this.state.memberInput;
        let guestIDs = this.state.guestIDs;
        guestInput.push(<p onClick={(e) => this.removeGuests(e)} data-value={name} itemID={id}>{name}</p>);
        guestIDs.push(id);
        console.log(guestIDs);
        this.setState({
            memberInput: guestInput,
            guestIDs: guestIDs
        });
        this.dropdown.current.style.display = "none";
    }

    /**
     * Removes user from member list when name is clicked
     * @author Noora Turunen
     * @param e: event to get the target
     */
    removeGuests(e) {
        let item = e.target.getAttribute('itemID');
        let guestInput = this.state.memberInput;
        let guestIDs = this.state.guestIDs;
        guestInput.forEach(function (index) {
            console.log(index.props.itemID);
            if (index.props.itemID == item) {
                guestInput.splice(guestInput.indexOf(index), 1);
                guestIDs.splice(guestInput.indexOf(index), 1);
            }}
        );
        this.setState({
            memberInput: guestInput,
            guestIDs: guestIDs
        });
    }

    /**
     * Goes to group event adding view and sets its member list to group objects members
     * @author Noora Turunen
     */
    addGroupEvent(){

        this.props.callbackFromParent({ids:this.state.touchedIDs,names:this.state.membersList});
    }
}

export default withTranslation() (Groups);
