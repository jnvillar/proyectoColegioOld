var path = require('path');
var exphbs = require('express-handlebars');
var hbs = exphbs.create({
    // Specify helpers which are only registered on this instance.
    helpers: {
        equal: function (lvalue, rvalue, options) {
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        makeResume: function (string) {
            return string.substring(0,300)+" ...";
        },
        isTeacher:function(name,profesor,teacher,options){
            if(teacher){
                if(name==profesor){
                    return options.fn(this);
                }
            }
            return options.inverse(this);
        },
        isStudent:function(teacher,admin,options){
            if(teacher || admin){
                return options.inverse(this);
            }else{
                return options.fn(this);
            }
        }
    }
});

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//mongoose.connect('mongodb://localhost/prueba');


var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };
var mongodbUri = 'mongodb://heroku_ktbs5cjz:ccf1s2kjfpdmvon8br6r0l4ltl@ds133398.mlab.com:33398/heroku_ktbs5cjz';
mongoose.connect(mongodbUri, options);


var conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'connection error:'));



var passport = require('passport');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser  = require('body-parser');
var flash   = require('connect-flash');
var methodOverride = require('method-override');
var funciones = require('./colegio');
var school = funciones.school();
var page = funciones.page();
var gradesManager = require('./grades');
gradesManager.start(mongoose);
var articleManager = require('./articles');
articleManager.start(mongoose);
var commentsManager = require('./comments');
commentsManager.start(mongoose);
var subjectsManager = require('./subjects');
subjectsManager.start(mongoose);
var users = require('./users');
users.start(mongoose,passport);

/*
users.createUser('alu','alu',false,"6to Año A","",false);
 users.createUser('alu2','alu',false,"6to Año A","",false);
 users.createUser('alu3','alu',false,"5to Año A","",false);
 users.createUser('alu4','alu',false,"5to Año A","",false);
 users.createUser('alu5','alu',false,"4to Año A","",false);
 users.createUser('admin','admin',true,"6to Año A","",false);
 users.createUser('tea','tea',true,"6to Año A","",true);*/
//var aux=[];
//var s = {};s.name = "matematica"; s.content = "esto es mate"; s.img = ""; s.profesor = "gonzalez"; s.imgProfesor= ""; s.year="tercero";
//aux.push(s);
//subjectsManager.createSubjects("tercero",aux);

var http = require("http");
var url = require("url");
var fs = require('fs');
var express = require("express");
var app = express();
var _ = require('underscore');
var request = require('request');
body = require('body-parser');
app.use(body.json());
app.use(body.urlencoded({
    extended: true
}));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);
var options = { dotfiles: 'ignore', etag: false,
    extensions: ['htm', 'html'],
    index: false
};
app.use(express.static(path.join(__dirname, 'public') , options  ));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(flash());
app.use(session({ secret: 'keyboard cat',resave: false ,saveUninitialized:false,cookie:{maxAge:null}}));
app.use(passport.initialize());
app.use(passport.session());



app.get('/apiUserSubjects',function(req,res){
   if(req.user){
       var findUserSubjects;
       if(req.user.admin && !req.user.teacher){
           findUserSubjects = subjectsManager.getUserSubjects(req.user);
       }
       else if(req.user.teacher){
           findUserSubjects = subjectsManager.getTeacherSubjects(req.user.name);
       }
       else if(!req.user.admin && !req.user.teacher){
           findUserSubjects = subjectsManager.getUserSubjects(req.user);
       }

       findUserSubjects.then(function (userSubjects) {
           if (userSubjects == null){userSubjects ={}}
           res.send(JSON.stringify(userSubjects))
       })
   }else{
       res.redirect('../')
   }
});

app.get('/apiArticles',function(req,res){
    if(req.user) {
        var findArticles = articleManager.getArticles();
        findArticles.then(function(articles) {
            res.send(JSON.stringify(articles.reverse()));
        });

    }else{
        res.redirect('../')
    }
});


app.get('/apiAllSubjects',function(req,res){
    if(req.user && (req.user.admin || req.user.teacher)) {
        var findAllSubjects = subjectsManager.getSubjects();
        findAllSubjects.then(function(allSubjects) {
            res.send(JSON.stringify(allSubjects));
        });
    }else{
        res.redirect('../')
    }
});


app.get('/apiSubjectPosts/:idS',function (req,res) {
    if(req.user) {
        var idS = req.params.idS;
        var findSubjectPosts = subjectsManager.getSubjectPosts(idS);
        findSubjectPosts.then(function(subjectPosts) {
            res.send(JSON.stringify(subjectPosts));
        });
    }else{
        res.redirect('../')
    }
});


app.get('/apiSubjectPost/:idS/:idP',function (req,res) {
    if(req.user) {
        var idS = req.params.idS;
        var idP = req.params.idP;
        var findSubjectPosts = subjectsManager.getSubjectPosts(idS);
        findSubjectPosts.then(function(subjectPosts) {
            var post = subjectsManager.findOnePostInPost(idP,subjectPosts.posts);
            res.send(JSON.stringify(post));
        });
    }else{
        res.redirect('../')
    }
});


app.get('/apiStudentsInYear/:year',function(req,res){
    if(req.user && (req.user.admin || req.user.teacher)) {
        var year = req.params.year;
        var findStudentsInYear = users.getUsersInYear(year);
        findStudentsInYear.then(function(studentsInYear) {
            res.send(JSON.stringify(studentsInYear));
        });
    }else{
        res.redirect('../')
    }
});


app.get('/apiComments/:idP',function (req,res) {
    var idP = req.params.idP;
    if(req.user) {
        var findComments = commentsManager.getComments(idP);
        findComments.then(function(comments) {
            res.send(JSON.stringify(comments));
        });
    }else{
        res.redirect('../')
    }
});

app.get('/apiArticle/:idP',function (req,res) {
    var idP = req.params.idP;
    if(req.user) {
        var findArticle = articleManager.findArticle(idP);
        findArticle.then(function(article) {
            res.send(JSON.stringify(article));
        });
    }else{
        res.redirect('../')
    }
});


app.get('/apiAllStudents',function (req,res) {
    if(req.user && (req.user.teacher || req.user.admin)) {
        var findAllStudents = users.getStudents();
        findAllStudents.then(function(students) {
            res.send(JSON.stringify(students));
        });
    }else{
        res.redirect('../')
    }
});


app.get('/apiStudentGrades/:idS/:idU',function (req,res) {
    if(req.user && (req.user.teacher || req.user.admin)) {
        var idS = req.params.idS;
        var idU = req.params.idU;
        var findStudentGrades = gradesManager.getUserGrades(idU);
        findStudentGrades.then(function(studentGrades) {
            var grades = [];
            for (var i = 0; i < studentGrades.grades.length; i++) {
                if (studentGrades.grades[i].idS == idS) {
                    grades.push(studentGrades.grades[i]);
                }
            }
            res.send(JSON.stringify(grades));
        });
    }else{
        res.redirect('../')
    }
});

app.get('/', function (req, res) {
    res.render('indexMain',{school:school,page:page});
});

app.get('/courses/logout',function(req,res){
    console.log("login out");
    if(req.user) {
        req.logout();
        res.redirect('../')
    }else {
        res.redirect('../')
    }
});

app.get('/courses/logIn',function(req,res) {
    if(req.user) {
        res.redirect('/courses');
    }else {
        res.render('logIn', {page: page});
    }
});

/* POSTS */
/* POSTS */
/* POSTS */
/* POSTS */
/* POSTS */
/* POSTS */
/* POSTS */

/* POSTS */
/* POSTS */
/* POSTS */
/* POSTS */
/* POSTS */
/* POSTS */
/* POSTS */

/* POSTS */
/* POSTS */
/* POSTS */
/* POSTS */
/* POSTS */
/* POSTS */
/* POSTS */

app.post("/courses/newSubject",function(req,res){
    req.body.year = req.body.year + " " + req.body.div;
    req.body.div = null;
    if(req.user && req.user.admin) {
        subjectsManager.newSubject(req.body);
        res.redirect('../courses/allSubjects');
    }else{
        res.redirect('../courses/logIn');
    }
});

app.post("/newComment/:id",function(req,res){
    if(req.user) {

        var id = req.params.id;
        req.body.name = req.user.name;
        req.body.postId = id;
        req.body.likes = 0;
        req.body.dislikes = 0;
        req.body.votersPos = [];
        req.body.votersNeg = [];
        commentsManager.newComment(req.body);
        res.redirect(req.headers.referer);
    }else{
        res.redirect('courses/logIn');
    }
});

app.post('/mandarEmail',function (req,res) {
    //mu.clearCache();
    var stream = mu.compileAndRender('mainpage/index.html',{school: school,page: page});
    stream.pipe(res);
});

app.post('/nuevoPostMateria/:id', function (req, res) {
    if(req.user){
        var id = req.params.id;
        var findSubject = subjectsManager.findSubject(id);
        findSubject.then(function (subject) {
            var subject = _.find(subject.subjects, function(subject) {
                return subject['_id'] == id;
            });
            subjectsManager.newPost(req.user,req.body,subject.year,subject.name,subject._id);
            res.redirect('../subject/'+id);
        });
    }else{
        res.redirect('../courses/logIn');
    }

});

app.post("/courses/nuevoArticulo",function(req,res){
    if(req.user) {
        req.body.author = req.user.name;
        req.body.imgAuthor = req.user.img;

        articleManager.newArticle(req.body);
        res.redirect('../courses');
    }else{
        res.redirect('../courses/logIn');
    }
});

app.post('/courses/modifyGrade/:idG/:idU/:idS',function (req,res) {
    if(req.user && req.user.teacher){
        var idG = req.params.idG;
        var idU = req.params.idU;
        var idS = req.params.idS;
        var userSubjects = subjectsManager.getUserSubjects(req.user);
        var findUser = users.getUser(idU);
        userSubjects.then(function (subjects) {
            if(subjects==null){subjects={}}
            findUser.then(function (student) {
                gradesManager.modifyGrade(student._id,idG,req.body);
                res.redirect('../../../getGrades/'+idS+'/'+idU);
            });
        });
    }else{
        res.redirect('../courses/logIn');
    }
});


app.post('/courses/logIn', passport.authenticate('local',{
        successRedirect: '../courses',
        failureRedirect: '../courses/logIn',
        failureFlash:'Informacion Invalida'
    }
));

app.post('/courses/newGrade/:idS/:idU/:year',function (req,res) {
    if(req.user && req.user.teacher) {
        var year = req.params.year;
        var idS = req.params.idS;
        var idU = req.params.idU;
        var findSubject = subjectsManager.findSubject(idS);
        var findUser = users.getUser(idU);
        findSubject.then(function (subject) {
            var subject = _.find(subject.subjects, function (subject) {
                return subject['_id'] == idS;
            });
            findUser.then(function (user) {
                gradesManager.addGrade(user, subject, req.body);
                res.redirect('../../../../courses/years/'+year+'/'+idS);
            })
        })
    }else{
        res.redirect('../');
    }
});

/* FORMULARIOS */
/* FORMULARIOS */
/* FORMULARIOS */
/* FORMULARIOS */
/* FORMULARIOS */
/* FORMULARIOS */

/* FORMULARIOS */
/* FORMULARIOS */
/* FORMULARIOS */
/* FORMULARIOS */
/* FORMULARIOS */
/* FORMULARIOS */

/* FORMULARIOS */
/* FORMULARIOS */
/* FORMULARIOS */
/* FORMULARIOS */
/* FORMULARIOS */
/* FORMULARIOS */

app.get('/courses/newSubject', function (req, res) {
    if(req.user && req.user.admin) {
        var findTeachers = users.getProfesors();
        findTeachers.then(function (teachers) {
            var findUserSubjects = subjectsManager.getUserSubjects(req.user);
            findUserSubjects.then(function (userSubjects) {
                if(userSubjects==null){userSubjects={}};
                res.render('formularioNewSubject',{page: page, school: school,user: req.user,teachers:teachers,userSubjects: userSubjects.subjects});
            })

        });
    }else{
        res.redirect('../courses');
    }
});

app.get('/courses/nuevoArticulo', function (req, res) {
    if(req.user) {
        var userSubjects = subjectsManager.getUserSubjects(req.user);
        var findTeacherSubjects = subjectsManager.getTeacherSubjects(req.user.name);
        userSubjects.then(function (subjects) {
            if(subjects==null){subjects={}};
            findTeacherSubjects.then(function(teacherSubjects) {
                if (teacherSubjects == null) {teacherSubjects = {}}
                res.render('formularioArticulo', {
                    page: page,
                    school: school,
                    teacherSubjects:teacherSubjects,
                    userSubjects: subjects.subjects,
                    user: req.user
                })
            })
        })
    }else{
        res.redirect('../courses/logIn');
    }
});

app.get('/courses/newGrade/:idS/:idU',function (req,res) {
    if(req.user && req.user.teacher){
        var idS = req.params.idS;
        var idU = req.params.idU;
        var findSubject = subjectsManager.findSubject(idS);
        var findTeacherSubjects = subjectsManager.getTeacherSubjects(req.user.name);
        var findUser = users.getUser(idU);
        findSubject.then(function (subject) {
            var subject = _.find(subject.subjects, function (subject) {
                return subject['_id'] == idS;
            });
            findTeacherSubjects.then(function (teacherSubjects) {
                if(teacherSubjects==null){teacherSubjects={}}
                findUser.then(function (student) {
                    res.render('formularioNota', {
                        page: page,
                        school: school,
                        student:student,
                        subject: subject,
                        teacherSubjects: teacherSubjects,
                        user: req.user
                    });
                });
            });
        });
    }else{
        res.redirect('../courses/logIn');
    }
});

app.get('/courses/modifyGrade/:idG/:idU/:idS',function (req,res) {
    if(req.user && req.user.teacher){
        var idG = req.params.idG;
        var idU = req.params.idU;
        var idS = req.params.idS;
        var findTeacherSubjects = subjectsManager.getTeacherSubjects(req.user.name);
        var findUser = users.getUser(idU);
        findTeacherSubjects.then(function (teacherSubjects) {
            if(teacherSubjects==null){teacherSubjects={}}
            findUser.then(function (student) {
                res.render('formularioModificarNota', {
                    page: page,
                    school: school,
                    student:student,
                    subject:{idS:idS},
                    grade:{idG:idG},
                    teacherSubjects: teacherSubjects,
                    user: req.user
                });
            });
        });
    }else{
        res.redirect('../courses/logIn');
    }
});

app.get('/nuevoPostMateria/:id', function (req, res) {
    if(req.user && req.user.teacher){
        var id = req.params.id;
        var userSubjects = subjectsManager.getUserSubjects(req.user);
        var findTeacherSubjects = subjectsManager.getTeacherSubjects(req.user.name);
        userSubjects.then(function (subjects) {
            if(subjects==null){subjects={}};
            findTeacherSubjects.then(function(teacherSubjects) {
                if (teacherSubjects == null) {teacherSubjects = {}}
                res.render('formularioSubject', {
                    page: page,
                    school: school,
                    id: id,
                    teacherSubjects: teacherSubjects,
                    userSubjects: subjects.subjects,
                    user: req.user
                })
            })
        })
    }else{
        res.redirect('../courses/logIn');
    }

});

/* FUNCIONES PARA BORRAR */
/* FUNCIONES PARA BORRAR */
/* FUNCIONES PARA BORRAR */
/* FUNCIONES PARA BORRAR */
/* FUNCIONES PARA BORRAR */
/* FUNCIONES PARA BORRAR */
/* FUNCIONES PARA BORRAR */
/* FUNCIONES PARA BORRAR */

app.get('/deleteSubject/:idS',function (req,res) {
    if(req.user && req.user.admin){
        var idS = req.params.idS;
        subjectsManager.deleteSubject(idS,commentsManager);
        res.redirect("../courses/allSubjects");
    }else{
        res.redirect('../courses');
    }
});

app.get('/deleteSubjectPost/:idP',function (req,res) {
    if(req.user && (req.user.teacher || req.user.admin)){
        var idP = req.params.idP;
        subjectsManager.deleteSubjectPost(idP,commentsManager);
        res.redirect('../courses/allSubjects');
    }else{
        res.redirect('../courses');
    }
});

app.get('/deleteYear/:year',function (req,res) {
    if(req.user && req.user.admin){
        var year = req.params.year;
        subjectsManager.deleteYear(year,commentsManager);
        res.redirect("../courses/allSubjects");
    }else{
        res.redirect('../courses');
    }
});

app.get('/borrarArticulo/:id', function (req, res) {
    if(req.user) {
        var id = req.params.id;
        articleManager.deleteArticle(id);
        commentsManager.deleteComments(id);
        res.redirect('../courses');
    }else{
        res.redirect('../courses/logIn');
    }
});

app.get('/borrarComentario/:idC', function (req, res) {
    if(req.user) {
        var idc = req.params.idC;
        commentsManager.deleteComment(idc);
        res.redirect(req.headers.referer);
    }else{
        res.redirect('../courses/logIn');
    }
});

app.get("/voteComment/:idC/:vote",function(req,res){
    if(req.user) {

        var idC = req.params.idC;
        var type = req.params.vote;
        var voter = req.user.name;

        commentsManager.voteComment(idC, type,voter);
        res.redirect(req.headers.referer);
    }else{
        res.redirect('../courses/logIn');
    }
});

/* LO DE ABAJO NO ES API */
/* LO DE ABAJO NO ES API */
/* LO DE ABAJO NO ES API */
/* LO DE ABAJO NO ES API */
/* LO DE ABAJO NO ES API */
/* LO DE ABAJO NO ES API */

/* LO DE ABAJO NO ES API */
/* LO DE ABAJO NO ES API */
/* LO DE ABAJO NO ES API */
/* LO DE ABAJO NO ES API */
/* LO DE ABAJO NO ES API */
/* LO DE ABAJO NO ES API */

/* LO DE ABAJO NO ES API */
/* LO DE ABAJO NO ES API */
/* LO DE ABAJO NO ES API */
/* LO DE ABAJO NO ES API */
/* LO DE ABAJO NO ES API */
/* LO DE ABAJO NO ES API */


app.get('/courses', function (req, res) {
    if(req.user) {
        var articles = articleManager.getArticles();
        var userSubjects = subjectsManager.getUserSubjects(req.user);
        var findTeacherSubjects = subjectsManager.getTeacherSubjects(req.user.name);
        articles.then(function (articles) {
            userSubjects.then(function (subjects) {
                if(subjects==null){subjects={}}
                findTeacherSubjects.then(function (teacherSubjects) {
                    if(teacherSubjects==null){teacherSubjects={}}
                    res.render('indexCoursesNew',{ school:school,
                        articles:articles.reverse(),
                        page:page,
                        teacherSubjects: teacherSubjects,
                        subjects:subjects.subjects,
                        user:req.user});
                })
            });
        });
    }else{
        res.redirect('../courses/logIn');
    }
});


/*
app.get('/courses',function(req,res){
    res.sendFile(path.join(__dirname + '/coursesx.html'));
});
*/


app.get('/courses/students',function(req,res){
    if(req.user && req.user.admin){
        var findStudents = users.getStudents();
        findStudents.then(function (students) {
            if(students==null){students={}}
            var studentPerYear = _.groupBy(students,'year');
            res.render('students',{ page: page,
                                    school: school,
                                    students: studentPerYear,
                                    user:req.user});
        })
    }else{
        res.redirect('../courses/logIn');
    }
});

app.get('/courses/years',function (req,res) {
    if(req.user && req.user.teacher){
        var findTeacherSubjects = subjectsManager.getTeacherSubjects(req.user.name);
        var findSubjects = subjectsManager.getSubjects();
        findTeacherSubjects.then(function (teacherSubjects) {
            if(teacherSubjects==null){teacherSubjects={}}
            findSubjects.then(function (subjects){
                res.render('years',{page: page,
                                    school: school,
                                    users: users,
                                    subjects: subjects,
                                    teacherSubjects: teacherSubjects,
                                    user:req.user});
                })
            });
    }else{
        res.redirect('../courses/logIn');
    }
});

app.get('/courses/years/:year/:idS',function(req,res) {
    if(req.user && req.user.teacher) {
        var year = req.params.year;
        var idS = req.params.idS;
        var findUsersInYear = users.getUsersInYear(year);
        var userGrades = gradesManager.getUserGrades(req.user._id);
        var findTeacherSubjects = subjectsManager.getTeacherSubjects(req.user.name);
        var findSubject = subjectsManager.findSubject(idS);
        findSubject.then(function (subject) {
            var subject = _.find(subject.subjects, function (subject) {
                return subject['_id'] == idS;
            });
            findUsersInYear.then(function (students) {
                findTeacherSubjects.then(function (teacherSubjects) {
                    if (teacherSubjects == null) {teacherSubjects = {}}
                    res.render('studentsPerYear', {
                        page: page,
                        school: school,
                        user: req.user,
                        teacherSubjects: teacherSubjects,
                        subject: subject,
                        students: students
                    });
                    })
                })
            });
    }else {
        res.render('logIn', {page: page});
    }
});

app.get('/courses/getGrades/:idS/:idU',function (req,res) {
    if(req.user && req.user.teacher){
        var idU = req.params.idU;
        var idS = req.params.idS;
        var findGrades = gradesManager.getUserGrades(idU);
        var findUser = users.getUser(idU);
        var findTeacherSubjects = subjectsManager.getTeacherSubjects(req.user.name);
        findGrades.then(function (studentGrades) {
            var grades = [];
            for (var i = 0; i < studentGrades.grades.length; i++) {
                if (studentGrades.grades[i].idS == idS) {
                    grades.push(studentGrades.grades[i]);
                }
            }
            findUser.then(function (student) {
                findTeacherSubjects.then(function (teacherSubjects) {
                    if(teacherSubjects==null){teacherSubjects={}}
                    res.render('studentGrades', {
                        page: page,
                        school: school,
                        student:student,
                        subject: {idS:idS},
                        studentGrades:grades,
                        teacherSubjects: teacherSubjects,
                        user: req.user})
                });
            });
        })
    }else{
        res.redirect('../../../');
    }
});



app.get('/article/:id', function (req, res) {
    if(req.user){
        var id = req.params.id;
        var comments = commentsManager.getComments(id);
        var article = articleManager.findArticle(id);
        var userSubjects = subjectsManager.getUserSubjects(req.user);
        var findTeacherSubjects = subjectsManager.getTeacherSubjects(req.user.name);
        article.then(function (article) {
            comments.then(function (comments) {
                userSubjects.then(function (subjects) {
                    if(subjects==null){subjects={}};
                    findTeacherSubjects.then(function (teacherSubjects) {
                        if(teacherSubjects==null){teacherSubjects={}};
                        res.render('single',{page: page,
                            school: school,
                            article: article[0],
                            comments: comments,
                            user: req.user,
                            teacherSubjects:teacherSubjects,
                            subjects: subjects.subjects});
                    })
                })
            })
        })
    }else{
        res.redirect('../courses/logIn');
    }
});

app.get('/subject/:id', function (req, res) {
    if(req.user){
        var id = req.params.id;
        var userSubjects = subjectsManager.getUserSubjects(req.user);
        var findTeacherSubjects = subjectsManager.getTeacherSubjects(req.user.name);
        userSubjects.then(function (subjects) {
            if(subjects==null){subjects={}}
            var findSubject = subjectsManager.findSubject(id);
            findSubject.then(function (subject) {
                var subject = _.find(subject.subjects, function(subject) {
                    return subject['_id'] == id;
                });

                var subjectPosts = subjectsManager.getSubjectPosts(subject._id);
                subjectPosts.then(function (posts) {
                    findTeacherSubjects.then(function (teacherSubjects) {
                        if (teacherSubjects == null) {teacherSubjects = {}}
                        res.render('subject', {
                            page: page,
                            school: school,
                            posts: posts.posts,
                            user: req.user,
                            teacherSubjects:teacherSubjects,
                            userSubjects: subjects.subjects,
                            subject: subject
                        })
                    })
                })
            })
        })
    }else{
        res.redirect('../courses/logIn');
    }

});

app.get('/subjectPost/:idSubject/:idPost', function (req, res) {
    if(req.user){
        var idSubject = req.params.idSubject;
        var idPost = req.params.idPost;
        var findComments = commentsManager.getComments(idPost);
        var userSubjects = subjectsManager.getUserSubjects(req.user);
        var findTeacherSubjects = subjectsManager.getTeacherSubjects(req.user.name);
        findComments.then(function (comments) {
            userSubjects.then(function (subjects) {
                if(subjects==null){subjects={}}
                var findSubject = subjectsManager.findSubject(idSubject);
                findSubject.then(function (subject) {
                    var subject = _.find(subject.subjects, function(subject) {
                        return subject['_id'] == idSubject;
                    });
                    var subjectPosts = subjectsManager.getSubjectPosts(subject._id);
                    subjectPosts.then(function (posts) {
                        var post = subjectsManager.findOnePostInPost(idPost,posts.posts);
                        findTeacherSubjects.then(function(teacherSubjects){
                            if(teacherSubjects==null){teacherSubjects={}}
                            res.render('subjectPost',{  page: page,
                                school: school,
                                post: post,
                                user:req.user,
                                teacherSubjects: teacherSubjects,
                                userSubjects: subjects.subjects,
                                subject:subject,
                                comments:comments});
                        })
                    });
                });
            });
        });
    }else{
        res.redirect('../courses/logIn');
    }
});

app.get('/courses/allSubjects',function(req,res){
    if(req.user && req.user.admin){
        var getsubjects = subjectsManager.getSubjects();
        var findUserSubjects = subjectsManager.getUserSubjects(req.user);
        var findTeacherSubjects = subjectsManager.getTeacherSubjects(req.user.name);
        getsubjects.then(function(subjects){
            findUserSubjects.then(function(userSubjects) {
                findTeacherSubjects.then(function (teacherSubjects) {
                    if (teacherSubjects == null) {teacherSubjects = {}}
                    if (userSubjects == null) {userSubjects = {}}
                    res.render('allSubjects', {
                        user: req.user,
                        school: school,
                        page: page,
                        subjects: subjects,
                        teacherSubjects:teacherSubjects,
                        userSubjects: userSubjects.subjects
                    })
                });
            })
        })
    }else{
        res.redirect('../courses');
    }


});

app.use("/css",express.static(__dirname + '/css'));
app.use("/scss",express.static(__dirname + '/scss'));
app.use("/img",express.static(__dirname + '/images'));
app.use("/js",express.static(__dirname + '/js'));
app.use(express.static(__dirname +  '/'));

app.use(function(req, res){
    res.status(404);
    if (req.accepts('html')) {
       // mu.clearCache();
        res.render('404', {school: school,page: page});
        //var stream = mu.compileAndRender('mainpage/404.html', {school: school,page: page});
        //stream.pipe(res);
    }

});


app.listen(process.env.PORT || 3000);