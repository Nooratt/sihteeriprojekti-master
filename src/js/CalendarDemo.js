import React, { Component } from 'react';
import Calendar from 'react-calendar/dist/entry.nostyle';
import '../css/calendar.css';
import Tooltip from "react-simple-tooltip";
import { getWithoutParameters, getFromBackend, postToBackend, logIn } from './Ajax.js';
import {I18nextProvider} from 'react-i18next';
import i18next from 'i18next';
import { useTranslation, withTranslation, Trans } from 'react-i18next';
let popup = document.getElementsByClassName("popup")[0];
let self;

/**
 * @class CalendarDemo
 * Class for CalendarDemo component
 *  - uses 'react-calendar' library
 * @author Markus Ojajärvi
 */
class CalendarDemo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            events: [],
            entries: [],
            groupEvents: [],
            groups: [],
            groupsChecked: [],
            date: new Date(),
            dateUpdated: false
        };
        this.callbackResults = {
            events: null,
            entries: null,
            groups: null,
            groupEvents: null
        };
        this.groups = {
            checked: []
        };
        this.date = {
            sdate: null,
            edate: null
        };
        self = this;
        this.getCalendarData(new Date(), "date");
        this.onActiveDateChange = activeStartDate => this.getCalendarData(activeStartDate, "activeStartDate");
        this.onClickDay = day => this.renderPopup(day);
        this.defaultEntry = React.createRef();
        this.defaultEvent = React.createRef();
        this.defaultGroupEvent = React.createRef();
    }


    render() {
        let entries = this.state.entries;
        let events = this.state.events;
        let groupEvents = this.state.groupEvents;

        /**
         * A constant which returns the date specific events and entries as React elements
         * @author Markus Ojajärvi
         * @param date: the Date object of the specific calendar 'tile'
         * @param view: day, month, or year
         * @returns {*}
         */
        const tileContent = ({date, view}) => {
            for (var i = 0; i < this.state.result.length; i++) {
                let elementDate = this.constructDate(this.state.result[i].Date, "json");
                if (view === 'month' && this.constructDate(date, "date") === elementDate) {
                    entries.push(React.createElement("p", {
                        id: "defaultEntry",
                        ref: this.defaultEntry
                    }, this.state.result[i].Content));
                    let calendarEntries = [];
                    for (var i = 0; i < events.length; i++) {
                        let elementDate = this.constructDate(events[i].SDate, "json");
                        if (view === 'month' && this.constructDate(date, "date") === elementDate) {
                            calendarEntries.push(React.createElement("p", {
                                id: "defaultEvent",
                                ref: this.defaultEvent
                            }, events[i].Title));
                        }
                    }

                    for (var j = 0; j < entries.length; j++) {
                        let elementDate = this.constructDate(entries[j].Date, "json");
                        if (view === 'month' && this.constructDate(date, "date") === elementDate) {
                            calendarEntries.push(React.createElement("p", {
                                id: "defaultEntry",
                                ref: this.defaultEntry
                            }, entries[j].Content));
                        }
                    }
                    for (var k = 0; k < groupEvents.length; k++) {
                        let elementDate = this.constructDate(groupEvents[k].SDate, "json");
                        if (view === 'month' && this.constructDate(date, "date") === elementDate) {
                            calendarEntries.push(React.createElement("p", {
                                id: "defaultGroupEvent",
                                ref: this.defaultGroupEvent
                            }, groupEvents[k].Title));
                        }
                    }
                    return <div onClick={() => console.log("moikku")}>{calendarEntries.values()}</div>;
                }

                return (
                    <div>
                        <div id={"groupBar"}>{this.state.groups}</div>
                        <Calendar
                            onClickDay={this.onClickDay}
                            tileContent={tileContent}
                            onActiveDateChange={this.onActiveDateChange}>
                        </Calendar>
                    </div>
                );


            }
        };

        /**
         * Function called on first render, and when onActiveChangeDate method fires
         * @param date
         * @param dateType
         * @author Markus Ojajärvi
         */
        async getCalendarData(date, dateType) {
            let sdate, edate;
            let eventResult = [];
            let entryResult = [];
            let groupResult = [];

            if (dateType === "activeStartDate") {
                sdate = this.constructDate(date.activeStartDate, "startOf");
                self.date.sdate = sdate;
                edate = this.constructDate(date.activeStartDate, "endOf");
                self.date.edate = edate;
            }
            if (dateType === "date") {
                sdate = this.constructDate(date, "startOf");
                self.date.sdate = sdate;
                edate = this.constructDate(date, "endOf");
                self.date.edate = edate;
            }
            getFromBackend({
                    sdate: sdate,
                    edate: edate
                },
                "events",
                eventCallback);
            getFromBackend({
                    sdate: sdate,
                    edate: edate
                },
                "entries",
                entryCallback);
            getFromBackend({}, 'groups', groupCallback);

            /**
             * Callback method which is given as a parameter on the Ajax method 'getFromBackend'.
             *  - innerfunction
             *  - for user's events
             * @param result: result from Ajax database request
             */
            function eventCallback(result) {
                eventResult = JSON.parse(result);
                self.updateCalendar(eventResult, "events");
            }

            /**
             * Callback method which is given as a parameter on the Ajax method 'getFromBackend'.
             *  - innerfunction
             *  - for user's entries
             * @param result: result from Ajax database request
             */
            function entryCallback(result) {
                entryResult = JSON.parse(result);
                self.updateCalendar(entryResult, "entries");
            }

            /**
             * @author Markus Ojajärvi
             * @param result: result from Ajax database request
             * @returns {Promise<void>}
             * Callback method which is given as a parameter on the Ajax method 'getFromBackend'.
             *  - innerfunction
             *  - for listing the user's active groups
             */
            function groupCallback(result) {
                let groups = JSON.parse(result);
                let groupChildren = [];
                groups.forEach(function (group) {
                    const groupElement = <div className="group" onChange={() => self.getGroupData(group.GanID)}
                                              itemID={group.GanID}>
                        <label>
                            <input type="checkbox"/><span>{group.GangName}</span>
                        </label>
                    </div>;
                    groupChildren.push(groupElement)
                });
                groupResult = groupChildren;
                self.updateCalendar(groupResult, "groups");
            }
        }

        async updateCalendar(result, type) {
            if (type === "events") {
                self.callbackResults.events = result;
            }
            if (type === "entries") {
                self.callbackResults.entries = result;
            }
            if (type === "groups") {
                self.callbackResults.groups = result;

            }
            if (type === "groupEvents") {
                self.callbackResults.groupEvents = result;
                await self.setState({groupEvents: result});
            }
            if (self.callbackResults.entries &&
                self.callbackResults.events &&
                self.callbackResults.groups) {
                await self.setState({
                    events: self.callbackResults.events,
                    entries: self.callbackResults.entries,
                    groups: self.callbackResults.groups
                });
                self.callbackResults = {};
            }
        }

        /**
         * Function that fires when clicking a group button
         *  - sets the component's state for the groups clicked
         * @author Markus Ojajärvi
         * @param groupID
         * @returns {Promise<void>}
         */
        async getGroupData(groupID){
            let checkedGroups = self.groups.checked;
            if (checkedGroups.includes(groupID)) {
                checkedGroups.splice(checkedGroups.indexOf(groupID), 1);
            } else {
                checkedGroups.push(groupID);
            }
            self.groups.checked = checkedGroups;
            if (checkedGroups.length === 0) {
                self.setState({groupEvents: []});
            }

            checkedGroups.forEach(function (group) {
                console.log("groupie no. " + group);
                getFromBackend({GanID: group}, 'members', memberCallback);
            });

            /**
             * @author Markus Ojajärvi
             * Callback method which is given as a parameter on the Ajax method 'getFromBackend'.
             *  - innerfunction
             *  - for active group members
             * @param result: result from Ajax database request
             */
            function memberCallback(result) {
                let groupEventResult = [];
                let members = JSON.parse(result);
                let memberList = [];
                members.forEach(function (member) {
                    memberList.push(member.accountAccID);
                });
                memberList = memberList.splice(1, 1);
                getFromBackend({
                    members: memberList,
                    sdate: self.date.sdate,
                    edate: self.date.edate
                }, "group-events", groupEventCallback);


                /**
                 * Callback method which is given as a parameter on the Ajax method 'getFromBackend'.
                 *  - innerfunction
                 *  - for groupEvents
                 * @author Markus Ojajärvi
                 * @param result from Ajax database request
                 * @returns {Promise<void>}
                 */
                async function groupEventCallback(result) {
                    let groupEventList = JSON.parse(result);
                    let newGroupEventList = [];
                    groupEventList.forEach(function (groupEvents) {
                        newGroupEventList = newGroupEventList.concat(groupEvents);
                    });
                    groupEventResult = newGroupEventList;
                    self.updateCalendar(groupEventResult, "groupEvents");
                }
            }


        }

        /**
         * Function that calls the editDate attribute method in the component props
         *  - Renders a floating popup for creating an event on the selected date
         * @author Markus Ojajärvi
         * @param value
         */
        renderPopup(value)
        {
            this.props.editDate(value);
            popup.style.display = "block";
        }

        /**
         * Function used to format a type of date to a String
         * @param value: the given date value, can be an object or a string
         * @param type: defines the type of the date
         * @returns {string}
         * @author Markus Ojajärvi
         */
        constructDate(value, type)
        {
            if (type === "json") {
                return value.substr(0, value.length - 14);
            } else {
                let dd = value.getDate();
                let mm = value.getMonth();
                let yyyy = value.getFullYear();

                if (type === "startOf") {
                    dd = "23";
                }
                if (type === "endOf") {
                    mm = (value.getMonth() + 2);
                    dd = "7"
                }
                if (type === "date") {
                    mm = (value.getMonth() + 1);
                }

                if (mm < 10) {
                    mm = "0" + mm;
                }
                if (dd < 10) {
                    dd = "0" + dd;
                }
                return (
                    yyyy + "-" + mm + "-" + dd
                );
            }
        }

    }
}

export default withTranslation() (CalendarDemo);