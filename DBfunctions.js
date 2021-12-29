/**
 * An object containing database tables and CRUD operations in ORM form
 * @type {{Account, Op, Entry, Category, Setting, Calendar, Event, Invitees, Profile, Notification}|*}
 */
var orm=require('./orm.js');

var DBfunctions = require('password-hash');

/**
 * Find user based on login email address.
 * @author Noora Turunen
 * @param email: A String of user email
 * @returns {Promise<Model>}
 */
async function getUser(email) {
    return orm.Profile.findOne({
        where: {
            email: email,
        }
    });
}


/**
 * Get profile with account id
 * @author Noora Turunen
 * @param accId: users id
 * @returns {Q.Promise<Array<Model>> | Q.Promise<any>}: returns the wanted profile promise
 *
 */
function getProfileByAccId(accId){
    return orm.Profile.findOne( {
        where: {
            accountAccID: accId,
        }
    });
}



//vertaa käyttäjän antamaa salasanaa tietokannan hashiin ja palauttaa true jos samat
/**
 * Compares a user given password with the hash in the database.
 * @author Noora Turunen
 * @param testPassword: String
 * @param dbPassword: String
 * @returns {boolean}: True, if password matches. False, if password does not match.
 */
function checkPassword(testPassword,dbPassword){
    var passwordCorrect=false;
    var respond=DBfunctions.verify(testPassword,dbPassword);

    if (respond == false) {
        console.log('salasana väärin')
        passwordCorrect= false;
    } else {
        passwordCorrect= true;
        console.log('salasana oikein')
    }
    return passwordCorrect;
}

//palauttaa true, jos käyttäjä löytyy ja salasana oikein
// Todo: does this actually return True/False correctly or is it another occurrence of Promise wizardry?
/**
 * Check if given user email and password match with those found in the database.
 * @author Noora Turunen
 * @param email: String
 * @param password: String
 * @returns {Promise<Model | never>} - Should return True, if correct. False, if not.
 */
function checkUserCredentials(email,password){
    return getUser(email).then(function(result){

        if (result==null){
            return false;
            console.log('ei ole käyttäjää');
        }else{
            console.log('käyttäjä löytyi');
            return checkPassword(password,result.Password);
        }
    });

}

/**
 * Create a new entry/event category on a given account.
 * @author Noora Turunen
 * @param name: String Name of new category
 * @param acId: Int Id of account
 * @returns {*}
 */
function createCategory(name,acId){
    return orm.Category.create({
        Name:name,
        accountAccID:acId,
    })
}

/**
 * Remove a category from a given account.
 * @author Noora Turunen
 * @param name: String Name of category to be removed.
 * @param acId: Int Id of account
 * @returns {*}
 */
function deleteCategory(name,acId){
    return orm.Category.destroy(
        {where:{Name:name,accountAccID:acId}}
    )
}

/**
 * Creates a new account, profile, default calendar and default settings with along with their associations.
 * Called when registering a new user.
 * @author Noora Turunen
 * @param name: String User first name
 * @param lname: String User last name
 * @param email: String User email
 * @param password: String User password
 * @returns {*}
 */
function registerUserToDB(name,lname,email,password){
    var hashword=DBfunctions.generate(password);
    var categoryList=["work","school","hobbies","friends"];
    return orm.Account.create({
        raw:true,
       profile:[{
           FirstName: name,
           LastName: lname,
           Email:email,
           Password: hashword,
       } ],
        calendar:[{
           View: 1
        }],
        setting:[{
            ProView:1,
            CalView:1,
            notification:[{
                ConNot: 2,
                EveNot: 2,
                GanNot: 2,
                AnsNot: 2,
                Rem: 2
            }]
        }]
    },{
        include:[orm.Account.Calendar,orm.Account.Profile,{association:orm.Account.Setting,include:[orm.Setting.Notification]}],
        }).then(result=>{
            var newId=result.get('AccID');
            categoryList.forEach(function(category){
                createCategory(category,newId);
            });

    });

}

/**
 * Removes an account from database.
 * @author Noora Turunen
 * @param accountID: Int Id of the account to be removed
 * @returns {Promise<void>}
 */
async function deleteAccountAndAssociations(accountID){

    var account=await orm.Account.findByPk(accountID);
    var profile=await account.getProfile();
    var calendar=await account.getCalendar();
    var setting=await account.getSetting();
    var notification=await setting.getNotification();
    notification.destroy();
    setting.destroy();
    calendar.destroy();
    profile.destroy();
    account.destroy();
}


//päivittää profiilin tiedot profiilin id:n perusteella --> vaihdetaan accountid?
/**
 * Updates profile information based on profileId. Can be used to update accountId?
 *
 * Example:
 * updateUserInfo('Peter','Griffin','peter.griffin@gmail.com',1).then(added=>{
 *   if(added){
 *       updateCalPrivacy(1,3);
 *   }});
 *
 * @author Noora Turunen
 * @param name: String Updated user first name
 * @param lname: String Updated user last name
 * @param email: String Updated user email
 * @param id: Int ProfileId which is used to locate the profile in database
 * @returns {*}
 */
function updateUserInfo(name,lname,email,accId){
    try {
        return orm.Profile.update(
            {FirstName:name,
                LastName:lname,
                Email:email},
            {where:{accountAccID:accId}
            })
    } catch(e) {
        return e;
    }


}

//Palauttaa user promisen tiedot halutulla id:llä, tietoja käytetään esimerkin mukaan result.FirstName jne.
/**
 * Returns a Promise object of a profile by a given profileId. Object used in the following manner:
 * getUserInfoForDocument(2).then(result=>{
 *   console.log( result.FirstName,result.LastName,result.Email);
 * });
 *
 * @author Noora Turunen
 * @param id: Int User profileId used to locate the user in Profiles table
 * @returns {Promise<Model>}
 */
function getUserInfoForDocument(id){
    return orm.Profile.findByPk(id)

}

//päivittää profiilinäkyvyyden tilin perusteella
/**
 * Update profile visibility setting
 * @author Noora Turunen
 * @param acId: Int User accountId
 * @param view: Int Profile visibility code (Todo: Code needs clarification here.)
 * @returns {*}
 */
function updateProfilePrivacy(acId,view){
    return orm.Setting.update(
        {ProView: view},
        {where:{accountAccID:acId}}
    )
}

//päivittää kalenterinäkyvyyden tilin perusteella
/**
 * Update calendar privacy setting by accountId
 * @author Noora Turunen
 * @param acId: Int User accountId
 * @param view: Int Calendar visibility code (Todo: Code needs clarification here.)
 * @returns {*}
 */
function updateCalPrivacy(acId,view){
    return orm.Setting.update(
        {CalView: view},
        {where:{accountAccID:acId}}
    )
}

function updatePrivacy(acId,pro,cal){
    return orm.Setting.update(
        {ProView:pro,
        CalView:cal},
        {where:{accountAccID:acId}}

    )
}

/**
 * Update user notification settings
 * Todo: JSDoc clarifications of the different parameters.
 *
 * Example:
 * updateNotifications(1,1,1,1,1,4).then(added=>{
 *   if(added){
 *       console.log('success');
 *   }})
 *   @author Noora Turunen
 * @param con: Int
 * @param gan: Int
 * @param eve: Int
 * @param ans: Int
 * @param rem: Int
 * @param setId: Int
 * @returns {*}
 */
function updateNotifications(con,gan,eve,ans,rem, setId){
    return orm.Notification.update(
        {   ConNot: con,
            EveNot: gan,
            GanNot: eve,
            AnsNot: ans,
            Rem: rem},
        {where:{settingSetId:setId}}
    )
}

//palauttaa kalenterin tilin mukaan
/**
 * Find calendar by accountId.
 *
 * Example:
 * getCalendarId(1).spread(function(user) {
 *   console.log(user.get('CalID'))
 * });
 *@author Noora Turunen
 * @param accId: Int User accountId
 * @returns {Promise<Array<Model>>}
 */
function getCalendarId(accId){
    return orm.Calendar.findAll({
        where: {accountAccID: accId}
    })
}

//luo tapahtuman ja liittää sen oikeaan kalenteriin ja luo sille adminin tilin mukaan
/**
 * Create an event, associate it with the correct Calendar, add the user as an admin by accountId, and add people as invitees.
 * Example:
 * var peoples=[1,3];
 * addEvent('sihterritapahtuma','2019-02-25 14:00:00','2019-02-25 20:00:00','18.00','00.00','kerhis','koodailua',1,0,2,2,peoples);
 *@author Noora Turunen
 * @param name: String Name of event
 * @param sdate: String Start date. Format 'YYYY-MM-DD'
 * @param edate: String End date. Format 'YYYY-MM-DD'
 * @param stime: String Start time
 * @param etime: String End time
 * @param venue: String Venue of event
 * @param info: String Supplied information
 * @param pri: Int Priority code given to event Todo: Code needs clarification here.
 * @param rep: Todo: Clarification?
 * @param accountId: Int User accountId used to give admin rights to event
 * @param cat: String Category for event
 * @param people: Users invited to this event at creation. Format is a table of accountIds [1,3,256]
 */
function addEvent(name,sdate,edate,stime,etime,venue,info,pri,rep,accountId,cat,people){
    try {


        getCalendarId(accountId).spread(result => {
            var calendar = result.get('CalID');
             orm.Event.create({
                Title: name,
                SDate: sdate,
                EDate: edate,
                STime: stime,
                ETime: etime,
                Venue: venue,
                Information: info,
                Priority: pri,
                Rep: rep,
                adm: [{
                    accountAccID: accountId
                }],
                calendarCalID: calendar,
                categoryCatID: cat
            }, {
                include: [orm.Event.Adm]
            }).then(result => {
                var event = result.get('EveID');
                people.forEach(function (element) {
                    orm.Invitees.create({
                        eventEveID: event,
                        accountAccID: element,
                    })
                })
            })
        })
    } catch(e){
    return e;
}

return true;
}


/**
 * Remove an event from database
 * NOTICE! Checking for event admin rights not done in this function!
 * @author Noora Turunen
 * @param eveID: Event Id used to locate the event
 * @returns {Promise<void>}
 */
async function deleteEventAndInvitees(eveID){

    const invitees=await orm.Invitees.findAll({where:{eventEveID:eveID}});
    invitees.forEach(async function(element){
        await element.destroy();
    });
    const event=await orm.Event.findByPk(eveID);
    await event.destroy();

}


/**
 * Create a new entry to user calendar
 * Example:
 * addEntry(1,'Dentist','2019-02-25 14:00:00','2019-02-25 14:00:00',1,1);
 *@author Noora Turunen
 * @param aID: Int User accountId
 * @param name: String Entry name
 * @param date: String Entry date. Format 'YYYY-MM-DD'
 * @param time: String Entry time
 * @param rem: Int Entry reminder code Todo: Code needs clarification here
 * @param cat: Int Entry category Id
 */
function addEntry(aID,name,date,time,rem,cat){

    try {
        getCalendarId(aID).spread(result => {
            var cal = result.get('CalID');

            orm.Entry.create({
                Content: name,
                Date: date,
                Time: time,
                Reminder: rem,
                categoryCatID: cat,
                calendarCalID: cal,

            })
        })
    } catch(e){
        return e;
    }

    return true;
}

//palauttaa kalenterin tapahtumat tilin perusteella
/**
 * Get calendar events by user accountId, and during a given time period.
 * @author Noora Turunen
 * @param acID: Int User accountId
 * @param sdate: String Search start date. Format 'YYYY-MM-DD'
 * @param edate: String Search end date. Format 'YYYY-MM-DD'
 * @returns {Q.Promise<Array<Model>> | Q.Promise<any>}: Function returns an array of Promises
 *
 */
async function getCalendarEvents(acID,sdate,edate){
    let eventIds=await getPlainEventIds(acID);
   return getCalendarId(acID).spread(result=>{
       var cal =result.get('CalID');
       return orm.Event.findAll({
           raw:true,
           where:{[orm.Op.or]:[{calendarCalID:cal,SDate:{[orm.Op.between]:[sdate,edate]}},{EveID:eventIds}]},

       })
    });

};

/**
 * Get calendar events where user is invited with accountID.
 * @author Noora Turunen
 * @param accID: Int User accountId
 * @returns {Q.Promise<Array<Model>> | Q.Promise<any>}: Function returns an array of Promises
 *
 */
function getEventsWhereInvited(accID){
    return orm.Invitees.findAll({
        where:{accountAccID:accID},
        attributes:['eventEveID'],
        raw:true
    })
}

/**
 * Get list of event ids.
 * @author Noora Turunen
 * @param accID: Int User accountId
 * @returns {Q.Promise<Array<Model>> | Q.Promise<any>}: Function 1 returns promises this function returns int[]
 */
function getPlainEventIds(accID){
    return getEventsWhereInvited(accID).then(result=>{
        var plainIDs=[];
        result.forEach(function(element){
            plainIDs.push(element.eventEveID);

        });
        return plainIDs;
    });
}

//palauttaa kalenterin merkinnät tilin perusteella
/**
 * Get calendar entries by user accountId, and during a given time period.
 * Example:
 * getCalendarEntries(2,'2019-02-25 10:00:00','2019-02-25 14:00:00').then(results=>{
 *   console.log(results);
 * });
 * @author Noora Turunen
 * @param acID: Int User accountId
 * @param sdate: String Search start date. Format 'YYYY-MM-DD'
 * @param edate: String Search end date. Format 'YYYY-MM-DD'
 * @returns {Q.Promise<Array<Model>> | Q.Promise<any>}: Function returns an array of Promises
 */
function getCalendarEntries(acID,sdate,edate){
    return getCalendarId(acID).spread(result=>{
        var cal =result.get('CalID');
        return orm.Entry.findAll({
            raw:true,
            where:{calendarCalID:cal,Date:{[orm.Op.between]:[sdate,edate]}},

        })
    });

};

//hakee käyttäjien nimet, joiden etu-, sukunimi, tai sposti sisältää annetun string
/**
 * Search for users whose first name, last name or email contains a given String
 * Example:
 * getUsers('tes').then(results=>{
 *   console.log(results);
 * })
 *
 * @author Noora Turunen
 * @param m: String to be searched
 * @returns {Promise<Array<Model>>}: Returns an array of Promises
 */
function getUsers(m){
    let words=m.split(" ");
    if(words.length>1){
        console.log(words[0]+words[1]);
        return orm.Profile.findAll({
            raw:true,

            where:{
                [orm.Op.or]: [{
                    [orm.Op.and]: {
                        FirstName: {[orm.Op.like]: ['%' + words[0] + '%']},
                        LastName: {[orm.Op.like]: ['%' + words[1] + '%']},
                    }},
                    {[orm.Op.and]:{
                        FirstName: {[orm.Op.like]: ['%' + words[1] + '%']},
                        LastName: {[orm.Op.like]: ['%' + words[0] + '%']},
                    }
                 }]

            }
        })
    }else {

        return orm.Profile.findAll({
            raw: true,

            where: {
                [orm.Op.or]: {
                    FirstName: {[orm.Op.like]: ['%' + m + '%']},
                    LastName: {[orm.Op.like]: ['%' + m + '%']},
                    Email: {[orm.Op.like]: ['%' + m + '%']},

                }

            }
        })
    }
}

/**
 * Creates group and its members
 * @author Noora Turunen
 * @param GroupObject: object where group name and list of group member ids
 * @param accountId:Int User account
 * @returns {boolean}: Function returns true if group is added or error
 *
 */
 function createGroup(GroupObject,accountId){
    try {
        GroupObject.people.push(accountId);

        orm.Gang.create({
            GangName: GroupObject.name,
            adm: [{
                accountAccID: accountId
            }]},{
             include: [orm.Gang.Adm]

        }).then(result => {
            var groupId = result.get('GanID');
            GroupObject.people.forEach(function (element) {
                orm.Members.create({
                    gangGanID: groupId,
                    accountAccID: element,
                })
            })
        })
    }catch(e){
        return e;
    }
    return true;

}

/**
 * Get the ids of the groups where I am a member.
 * @author Noora Turunen
 * @param accountId: Int User accountId
 * @returns {Q.Promise<Array<Model>> | Q.Promise<any>}: Function returns an array of Promises
 *
 */
function getMyGroupIds(accountId){
    return orm.Members.findAll({
        attributes:['gangGanID'],
        where:{accountAccID:accountId},
        raw:true
    })
}

/**
 * Get the groups where I am a member.
 * @author Noora Turunen
 * @param accountId: Int User accountId
 * @returns {Q.Promise<Array<Model>> | Q.Promise<any>}: Function returns an array of Promises
 */
 async function getMyGroups(accountId){
    let ids=await getMyGroupIds(accountId);
    console.log(ids);
    let justIds=[];
    ids.forEach(function(id){
        justIds.push(id.gangGanID);
    });

   return orm.Gang.findAll({
        where:{GanID:justIds},
       raw:true,

        })
 }

/**
 * Get the members of the group by group id.
 * @author Noora Turunen
 * @param groupId: Int group id
 * @returns {Q.Promise<Array<Model>> | Q.Promise<any>}: Function returns an array of Promises
 *
 */
 function getGroupMembers(groupId){

    return orm.Members.findAll({
        attributes:['accountAccID'],
        where:{gangGanID:groupId},
        raw:true

    })
 }
/**
 * Get profiles of the group members
 * @author Noora Turunen
 * @param groupId: Int group id
 * @returns {Q.Promise<Array<Model>> | Q.Promise<any>}: Function returns an array of Promises
 */
 async function getMemberProfiles(groupId){
    let ids=await getPlainMemberIds(groupId);
    return orm.Profile.findAll({
        where:{accountAccID:ids},
        raw:true
    })
 }

/**
 * Get list of the group ids where I am a member
 * @author Noora Turunen
 * @param groupId: Int group Id
 * @returns {Q.Promise<Array<Model>> | Q.Promise<any>}: The inner function returns int[]
 *
 */
function getPlainMemberIds(groupId){
   return getGroupMembers(groupId).then(result=>{
        var plainIDs=[];
        result.forEach(function(element){
            plainIDs.push(element.accountAccID);

        });

        return plainIDs;
    });
}

/**
 * Get all the events from every group member
 * @author Noora Turunen
 * @param memberList: List of members ids
 * @param startDate: starting date for the search
 * @param endDate: ending day of the search
 * @returns {Q.Promise<Array<Model>> | Q.Promise<any>}: List of event promises
 *
 */
 async function getGroupEvents(memberList,startDate,endDate){
    var events=[];

    for(const member of memberList){
        events.push(await getCalendarEvents(member,startDate,endDate));

    }

    return events;

}

/**
 * Get all the entries from every group member
 * @author Noora Turunen
 * @param memberList: List of members ids
 * @param startDate: starting date for the search
 * @param endDate: ending day of the search
 * @returns {Q.Promise<Array<Model>> | Q.Promise<any>}: Returns list of entry promises
 *
 */
 async function getGroupEntries(memberList,startDate,endDate){
    var entries=[];
    for(const member of memberList){
        entries.push(await getCalendarEntries(member,startDate,endDate));
    }
    return entries;
}

/**
 * Adds new contact for the user
 * @author Noora Turunen
 * @param contactId: Id of the new contact
 * @param accountId: users account id
 * @returns {Q.Promise<Array<Model>> | Q.Promise<any>}: Returns true, if the contact is added
 *
 */
async function addContact(contactId,accountId){
    try {

        return await orm.Contacts.create({
            profileProID: contactId,
            accountAccID: accountId
        }).then(result => {
            if (result.profileProID) {
                return true;
            } else {
                return false;
            }

        });
    }catch(e){
        return false;
    }
}

/**
 * Get all users contacts
 * @author Noora Turunen
 * @param accountId: users id
 * @returns {Q.Promise<Array<Model>> | Q.Promise<any>}: Returns list of contact promises
 *
 */
function getContacts(accountId){
    return orm.Contacts.findAll({
        where:{accountAccID:accountId},
        attributes:['profileProID'],
        raw:true
    })
}

/**
 * Get all contact profiles
 * @author Noora Turunen
 * @param accountId: users id
 * @returns {Q.Promise<Array<Model>> | Q.Promise<any>}: Returns list of contact profile promises
 *
 */
async function getContactProfiles(accountId){
    let ids=await getPlainContactIds(accountId);
    return orm.Profile.findAll({
        where:{accountAccID:ids},
        raw:true
    })
}

/**
 * Get list of my contacts ids
 * @author Noora Turunen
 * @param accountId: users id
 * @returns {Q.Promise<Array<Model>> | Q.Promise<any>}: Inner function returns a list of plain ids (no promises)
 *
 */
function getPlainContactIds(accountId){
    return getContacts(accountId).then(result=>{
        var plainIDs=[];
        result.forEach(function(element){
            plainIDs.push(element.profileProID);

        });
        return plainIDs;
    });
}

/**
 * Get my categories
 * @author Noora Turunen
 * @param accountId: users id
 * @returns {Q.Promise<Array<Model>> | Q.Promise<any>}: Returns list of my categories promises
 *
 */
function getMyCategories(accountId){
    return orm.Category.findAll({
        where:{accountAccID:accountId},
        raw:true,
    })
}


// Export all functions
module.exports = {
    registerUserToDB: registerUserToDB,
    getUser: getUser,
    checkPassword: checkPassword,
    checkUserCredentials: checkUserCredentials,
    createCategory: createCategory,
    deleteCategory: deleteCategory,
    updateUserInfo: updateUserInfo,
    getUserInfoForDocument: getUserInfoForDocument,
    updateProfilePrivacy: updateProfilePrivacy,
    updateCalPrivacy: updateCalPrivacy,
    updateNotifications: updateNotifications,
    getCalendarId: getCalendarId,
    addEvent: addEvent,
    addEntry: addEntry,
    getCalendarEvents: getCalendarEvents,
    getCalendarEntries: getCalendarEntries,
    deleteAccountAndAssociations:deleteAccountAndAssociations,
    deleteEventAndInvitees:deleteEventAndInvitees,
    getProfileByAccId: getProfileByAccId,
    getUsers: getUsers,
    getMyGroups:getMyGroups,
    createGroup:createGroup,
    getMemberProfiles:getMemberProfiles,
    getGroupEvents:getGroupEvents,
    getGroupEntries:getGroupEntries,
    addContact:addContact,
    getContactProfiles:getContactProfiles,
    updatePrivacy:updatePrivacy,
    getMyCategories:getMyCategories,
};








