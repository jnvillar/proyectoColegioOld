var SchemUsers;
var users;
var secret = 'ilovescotchyscotch';
var jwt    = require('jsonwebtoken');
var LocalStrategy = require('passport-local').Strategy;


module.exports = {


    start: function(db,passport){
        SchemUsers = db.Schema({name: String,
                                password: String,
                                admin: Boolean,
                                teacher: Boolean,
                                img: String,
                                year: String});
        users =  db.model('users', SchemUsers);

        passport.use(new LocalStrategy({usernameField:'name',passwordField: 'pass'},
            function(name, pass, cb) {
                users.findOne({name:name}, function(err, user) {
                    if (err) { return cb(err); }
                    if (!user) { return cb(null, false); }
                    if (user.password != pass) { return cb(null, false); }
                    return cb(null, user);
                });
            }));

        passport.serializeUser(function(user, cb) {
            cb(null, user.id);
        });

        passport.deserializeUser(function(id, cb) {
            users.findById(id, function (err, user) {
                if (err) { return cb(err); }
                cb(null, user);
            });
        });
    },

    getProfesors: function () {
        return users.find({teacher:true})
    },

    getStudents: function() {
        return users.find({admin: false, teacher: false})
    },

    createUser: function(name,pass,admin,year,img,teacher) {
        var user = new users({name: name,password: pass,admin: admin, year: year,img: img,teacher: teacher});
        user.save(function (err) {
            if(err) console.log("Error saving user");
            else {console.log("User saved")}
        });
    },

    getUsersInYear: function (year) {
        return users.find({year:year})
    },

    getUser:function (idU) {
        return users.findOne({_id:idU})
    },

    authenticateUser: function (body,res) {
        var token;
        users.findOne({name:body.name},function (err,user) {
            if(err) {
                token = false;
                console.log("Error finding user");
                res.redirect('../courses/logIn');
            }
            if(!user) {
                console.log("No user with that name");
                token = false;
                res.redirect('../courses/logIn');
            }
            else if(user){
                if(user.password != body.pass){
                    console.log("Wrong Password");
                    token = false;
                    res.redirect('../courses/logIn');
                }else{
                    token = jwt.sign(user,secret);
                    res.redirect('../courses');
                }
            }
        });
    }


};