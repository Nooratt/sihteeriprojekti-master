var assert = require('assert');
var dbfunctions=require('../testDBfunctions.js');
var orm =require('../TestOrm.js');

describe('DB tests', function() {
    before(async()=>{
        await dbfunctions.registerUserToDB('unit3','testi3','info.unit3@gmail.com','testisalasana');
        await dbfunctions.registerUserToDB('unit2','testi2','info.unit2@gmail.com','testisalasana');
        await dbfunctions.registerUserToDB('unit','testi','info.unit@gmail.com','testisalasana');
        const accounts=await orm.Account.findAll({ order: [ [ 'createdAt', 'DESC' ]]});
        const acId=accounts[0].get('AccID');
        const guest1=accounts[1].get('AccID');
        const guest2=accounts[2].get('AccID');
        const peopleList=[guest1,guest2];
        await dbfunctions.addEvent('unitTapahtuma','2019-02-25 14:00:00','2019-02-25 20:00:00','18.00','00.00','testipaikka','Tämä on testi',1,0,acId,null,peopleList)

    });
    after(async()=>{
        const accounts=await orm.Account.findAll({ order: [ [ 'createdAt', 'DESC' ]]});
        const acId=accounts[0].get('AccID');
        const acId2=accounts[1].get('AccID');
        const acId3=accounts[2].get('AccID');
        await dbfunctions.deleteAccountAndAssociations(acId);
        await dbfunctions.deleteAccountAndAssociations(acId2);
        await dbfunctions.deleteAccountAndAssociations(acId3);
        const events=await orm.Event.findAll({limit: 1, order: [ [ 'createdAt', 'DESC' ]]});
        const eveId=events[0].get('EveID');
        await dbfunctions.deleteEventAndInvitees(eveId);
    });
    describe('#checkUserCredentials()', function() {
        it('should return true when correct test credentials are given', async()=> {
            const ok = await dbfunctions.checkUserCredentials('info.unit@gmail.com','testisalasana');
            assert.equal(ok,true);
        });
        it('should return false when incorrect password is given', async()=> {
            const ok = await dbfunctions.checkUserCredentials('info.unit@gmail.com','salasana');
            assert.equal(ok,false);
        });
        it('should return false when no user is found', async()=> {
            const ok = await dbfunctions.checkUserCredentials('no.such@mail.com','salasana');
            assert.equal(ok,false);
        });

    });
    describe('#registerUserToDB()', function() {

        it('should add new account, create profile and default calendar, settings and notifications for it', async () => {
            const accounts=await orm.Account.findAll({limit: 1, order: [ [ 'createdAt', 'DESC' ]]});
            const profileName= await accounts[0].getProfile().get('FirstName');
            assert.equal(profileName,'unit');
        });
        it('should create default calendar for account', async()=>{
            const accounts=await orm.Account.findAll({limit: 1, order: [ [ 'createdAt', 'DESC' ]]});
            const calendar=await accounts[0].getCalendar();
            assert.notEqual(calendar,null);
        });
        it('should create default settings and notification settings for account', async()=>{
            const accounts=await orm.Account.findAll({limit: 1, order: [ [ 'createdAt', 'DESC' ]]});
            const settings=await accounts[0].getSetting();
            const notifications=await settings.getNotification();
            assert.notEqual(settings,null);
            assert.notEqual(notifications,null);
        });
    });
    describe('#addEvent()', function(){

       it('should add new event for account',async()=>{
           const events=await orm.Event.findAll({limit: 1, order: [ [ 'createdAt', 'DESC' ]]});
           assert.equal(events[0].get('Title'),'unitTapahtuma');

       });
       it('should add given visitor list to db',async()=>{
           const events=await orm.Event.findAll({limit: 1, order: [ [ 'createdAt', 'DESC' ]]});
           const list=await events[0].getAccounts();
           assert.equal(list.length,2);
       });

    });
    describe('#getUsers(p)',function(){
       it('should get results when "uni" is searched',async()=>{
            const results = await dbfunctions.getUsers("uni");
            assert.ok(results.length>0);
       });

       it('should get no results when "uni7" is searched',async()=>{
           const results = await dbfunctions.getUsers("uni7");
           assert.ok(results.length<1);

       });
       it('should get result when "unit3 testi3" is searched',async()=>{
           const results = await dbfunctions.getUsers("unit3 testi3");
           assert.equal(await results[0].FirstName,'unit3');
           assert.equal(await results[0].LastName,'testi3');

       });
       it('should get result when "testi3 unit3" is searched',async()=>{
           const results = await dbfunctions.getUsers("testi3 unit3");
           assert.equal(await results[0].FirstName,'unit3');
           assert.equal(await results[0].LastName,'testi3');
       });
       it('should get results when "info.unit3@gmail.com" is searched',async()=>{
           const results = await dbfunctions.getUsers("info.unit3@gmail.com");
           assert.equal(await results[0].Email,'info.unit3@gmail.com');
       });
    });
});

