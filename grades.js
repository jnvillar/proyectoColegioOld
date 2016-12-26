var SchemGrade;
var SchemUserGrades;
var grade;
var userGrades;

module.exports = {
    start: function (db) {

        SchemGrade = db.Schema({
            year: String,
            subject: String,
            idS: String,
            value: Number,
            name: String,
            idU: String
        });

        SchemUserGrades = db.Schema({
            idUser: String,
            grades: [SchemGrade]
        });

        userGrades = db.model('userGrades',SchemUserGrades);
        grade = db.model('grades',SchemGrade);
    },

    getUserGrades: function(idUser){
        return userGrades.findOne({idUser:idUser})
    },
    
    modifyGrade: function (idUser,idGrade,body) {
        var findUserGrades = this.getUserGrades(idUser);
        findUserGrades.then(function (studentGrades) {
            if(studentGrades) {
                for (var i = 0; i < studentGrades.grades.length; i++) {
                    if (studentGrades.grades[i]._id == idGrade) {
                        studentGrades.grades[i].value = body.gradeValue;
                        studentGrades.grades[i].name = body.gradeName;
                        studentGrades.save();
                        break
                    }
                }
            }
        });
    },

    addGrade: function (user,subject,body) {
        var newGrade = new grade({year: subject.year, subject: subject.name, idS: subject._id, value:body.gradeValue, name:body.gradeName, idU: user._id});
        userGrades.findOne({idUser:user._id},function (err,res) {
            if(err){console.log("que paso")}
            if(res){
                res.grades.push(newGrade);
                res.save();
            }else{
                var grades = [];
                grades.push(newGrade);
                var newUserGrades = new userGrades({idUser:user._id,grades:grades});
                newUserGrades.save();
            }
        })
    }
};