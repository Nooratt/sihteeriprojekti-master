/**
 * An object containing database tables and CRUD operations in ORM form
 * @type {{Account, Op, Entry, Category, Setting, Calendar, Event, Invitees, Profile, Notification}|*}
 */
var orm=require('./TestOrm.js');

var DBfunctions = require('password-hash');

/**
 * Find user based on login email address.
 * @author Noora Turunen
 * @param email: A String of user email
 * @returns {Promise<Model>}
 */
function getUser(email) {
    return orm.Profile.findOne({
        where: {
            email: email,
        }
    });
}



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
            notif:[{
                ConNot: 2,
                EveNot: 2,
                GanNot: 2,
                AnsNot: 2,
                Rem: 2
            }]
        }]
    },{
        include:[orm.Account.Calendar,orm.Account.Profile,{association:orm.Account.Setting,include:[orm.Setting.Notif]}],
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
    var notification=await setting.getNotif();
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
    return orm.Notif.update(
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
function getCalendarEvents(acID,sdate,edate){
   return getCalendarId(acID).spread(result=>{
       var cal =result.get('CalID');
       return orm.Event.findAll({
           raw:true,
           where:{calendarCalID:cal,SDate:{[orm.Op.between]:[sdate,edate]}},

       })
    });

};

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
 function getMyGroups(accountId){

   return orm.Gang.findAll({
       include:[{
          model:orm.Account,
          through:{
              where: {accountAccID:accountId},
            }
       }],
       raw:true
        })
 }

 function getGroupMembers(groupId){

    return orm.Members.findAll({
        attributes:['accountAccID'],
        where:{gangGanID:groupId},
        raw:true

    })
 }


function getPlainMemberIds(){
   return getGroupMembers(3).then(result=>{
        var plainIDs=[];
        result.forEach(function(element){
            plainIDs.push(element.accountAccID);

        });
        return plainIDs;
    });
}


async function getGroupEvents(memberList,startDate,endDate){
    var events=[];

    for(const member of memberList){
        events.push(await getCalendarEvents(member,startDate,endDate));

    }

    return events;

}

async function getGroupEntries(memberList,startDate,endDate){
    var entries=[];
    for(const member of memberList){
        entries.push(await getCalendarEntries(member,startDate,endDate));
    }
    return entries;
}
/*
getGroupHappenings([1,2,3],'2019-02-01 10:00:00','2019-05-25 10:00:00').then((result)=>{
    console.log(result);
});



getMyGroups(3).then(result=>{
    console.log(result);
});


var GroupObject={name:'kaikkienGang',accountId:1,people:[2,3]};

console.log(createGroup(GroupObject));

getUsers('tes').then(results=>{
    console.log(results);
})
*/


/*getCalendarEntries(2,'2019-02-25 10:00:00','2019-02-25 14:00:00').then(results=>{
    console.log(results);
});*/

// Export all functions
module.exports = {
    registerUserToDB: registerUserToDB,
    getUser: getUser,
    checkPassword: checkPassword,
    checkUserCredentials: checkUserCredentials,
    createCategory: createCategory,
    deleteCategory: deleteCategory,
    registerUserToDB: registerUserToDB,
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

};


//addEntry(2,'hammpidoctor','2019-04-25 14:00:00','2019-04-25 14:00:00',1,null);
//addEntry(1,'piluperse','2019-05-25 14:00:00','2019-05-25 14:00:00',1,null);
// parametrit aID,name,date,time,rem,cat

//var peoples=[];
//addEvent('sihterritapahtuma','2019-02-25 14:00:00','2019-02-25 20:00:00','18.00','00.00','kerhis','koodailua',1,0,3,null,peoples);
// name,sdate,edate,stime,etime,venue,info,pri,rep,accountId,cat,people

/*getCalendarId(1).spread(function(user) {
    console.log(user.get('CalID'))

});

*/

/*
registerUserToDB('Anna','Asikkala','autismi@gmail.com','salasana').then(added=>{

});

updateNotifications(1,1,1,1,1,4).then(added=>{
    if(added){
        console.log('success');
    }
})


//käyttöesimerkkejä

updateUserInfo('uusitesti','uusitestinen','uusitesti@gmail.com',1).then(added=>{
    if(added){
        updateCalPrivacy(1,3);
    }
});
*/
/*
checkUserCredentials('moikku@mail.com','salasana').then(userOK=>{
    if(userOK){
        console.log(userOK);
        console.log('käyttäjä ja salasana ok, kirjaudutaan sisään');
    }else{
        console.log(userOK);
        console.log('käyttäjä tai salasana väärin');
    }
});


updateUserInfo('muokataan','testi','testi@mail.com',2).then(added=>{
    if(added){
        console.log('success');
    }else{
        console.log('no go');
    }
});

getUserInfoForDocument(2).then(result=>{
    console.log( result.FirstName,result.LastName,result.Email);
});

createCategory('koulu',1).then(ok=>{
            if(ok){
                deleteCategory('koulu',1).then(ok=>{
                    if(ok){
                        console.log('deleted');
                    }
                })
            }
        })


*/







