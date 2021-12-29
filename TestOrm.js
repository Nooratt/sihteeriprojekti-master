const Orm = require('sequelize');

// Paikallinen tietokanta

//const sequelize = new Orm('sihteeri', 'testi', 'testi', {
    //jenkinskanta
const sequelize = new Orm('database_r10', 'database_user10', 'user_password10', {
    host: 'localhost',
    port:3306,
    dialect: 'mysql',
    operatorsAliases: false,

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
});

// Virtuaalipalvelimen tietokanta
/*
const sequelize = new Orm('sihteeri', 'sihteeri', 'sihteeri', {
    host: 'localhost',
    port: '4444',
    dialect: 'mysql',
    operatorsAliases: false,

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
});
*/

const Op = sequelize.Op;

/*
sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });*/

const Calendar=sequelize.define('calendar',{
    CalID: {type:Orm.INTEGER,autoIncrement:true,primaryKey:true},
    View:{type:Orm.INTEGER,allowNull:false}
});

const Profile = sequelize.define('profile', {
    ProID: {type: Orm.INTEGER, autoIncrement: true, primaryKey: true},
    FirstName: {type: Orm.STRING, allowNull: false},
    LastName: {type: Orm.STRING, allowNull: false},
    Email: {type: Orm.STRING, allowNull: false},
    Password: {type: Orm.STRING, allowNull: false}
});

const Adm=sequelize.define('adm',{
    AdmID: {type:Orm.INTEGER,autoIncrement:true,primaryKey:true},
});


const Event=sequelize.define('event',{
    EveID: {type:Orm.INTEGER,autoIncrement:true,primaryKey:true},
    Title:{type:Orm.STRING,allowNull:false},
    SDate:{type:Orm.DATE,allowNull:false},
    EDate:{type:Orm.DATE,allowNull:false},
    STime:{type:Orm.STRING,allowNull:false},
    ETime:{type:Orm.STRING,allowNull:false},
    Venue:{type:Orm.STRING,allowNull:false},
    Information:{type:Orm.STRING,allowNull:false},
    Priority:{type:Orm.INTEGER,allowNull:false},
    Rep:{type:Orm.INTEGER,allowNull:false},
});


const Gang = sequelize.define('gang', {
    GanID: {type: Orm.INTEGER, autoIncrement: true, primaryKey: true},
    GangName: {type: Orm.STRING, allowNull: false}
});

const Setting = sequelize.define('setting', {
    SetID: {type: Orm.INTEGER, autoIncrement: true, primaryKey: true},
    ProView: {type: Orm.INTEGER, allowNull: false},
    CalView: {type: Orm.INTEGER, allowNull: false},
});

const Account=sequelize.define('account',{
    AccID: {type: Orm.INTEGER, autoIncrement: true, primaryKey: true},
});


const Note=sequelize.define('note',{
    NotID: {type:Orm.INTEGER,autoIncrement:true,primaryKey:true},
    Text:{type:Orm.STRING,allowNull:false},
    Tag:{type:Orm.STRING,allowNull:false,primaryKey:true},
});


const Entry=sequelize.define('entry',{
    EntID: {type:Orm.INTEGER,autoIncrement:true,primaryKey:true},
    Content:{type:Orm.STRING,allowNull:false},
    Date:{type:Orm.DATE,allowNull:false},
    Time:{type:Orm.DATE,allowNull:false},
    Reminder:{type:Orm.INTEGER,allowNull:false},
});

const Invitees = sequelize.define('invitees', {
    response: {type:Orm.INTEGER}

});

const Members=sequelize.define('members',{

});

const Category =sequelize.define('category',{
    CatID:{type:Orm.INTEGER,autoIncrement:true,primaryKey:true},
    Name:{type:Orm.STRING,allowNull:false}
});

const Notif = sequelize.define('notif',{
    NotID:{type:Orm.INTEGER,autoIncrement:true,primaryKey:true},
    ConNot:{type:Orm.INTEGER,allowNull:false},
    EveNot:{type:Orm.INTEGER,allowNull:false},
    GanNot:{type:Orm.INTEGER,allowNull:false},
    AnsNot:{type:Orm.INTEGER,allowNull:false},
    Rem:{type:Orm.INTEGER,allowNull:false},
})


Adm.belongsTo(Account);
Event.Adm=Event.belongsTo(Adm);
Adm.hasMany(Event);

Event.belongsTo(Calendar);
Calendar.hasMany(Event);

Event.belongsTo(Category);
Category.hasMany(Event);

Entry.belongsTo(Category);
Category.hasMany(Event);

Gang.Adm=Gang.belongsTo(Adm);
Adm.hasMany(Gang);

Setting.Notif=Setting.hasOne(Notif);

Account.belongsToMany(Gang, {through: Members});
Gang.belongsToMany(Account, {through: Members});

Account.Profile=Account.hasOne(Profile);
Account.Calendar=Account.hasOne(Calendar);
Account.Setting=Account.hasOne(Setting);

Category.belongsTo(Account);
Account.hasMany(Category);

Note.belongsTo(Account);
Account.hasMany(Note);

Calendar.hasMany(Entry);
Entry.belongsTo(Calendar);

Note.hasMany(Entry);
Entry.hasOne(Note);


Profile.belongsToMany(Account, {through: 'Contact'});
Account.belongsToMany(Profile, {through: 'Contact'});


Account.belongsToMany(Event, { through: Invitees });
Event.belongsToMany(Account, { through: Invitees });

//sequelize.sync({force:true});

module.exports = {
    Profile,
    Account,
    Setting,
    Calendar,
    Category,
    Notif,
    Event,
    Entry,
    Op,
    Invitees,
    Gang,
    Members,


}
