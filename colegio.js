var facility = function(id,name,photo,description,date){
    this.id = id;
    this.photo = photo;
    this.name = name
    this.description = description;
    this.date = date;
    this.link = "../";
};

var facility1 = new facility(1,"nombre1","../images/s1.jpg","descripcion instalacion 1", "fecha1");
var facility2 = new facility(2,"nombre2","../images/s2.jpg", "descripcion instalacion 2","fecha2");
var facility3 = new facility(3,"nombre3","../images/s3.jpg","descripcion instalacion 3", "fecha3");
var facility4 = new facility(4,"nombre4","../images/s4.jpg", "descripcion instalacion 4","fecha4");
var facilities = [facility1,facility2,facility3,facility4];

var boss = function (name,description,photo,mail,link) {
    this.name = name;
    this.description =  description;
    this.photo = photo;
    this.mail = mail;
    this.link
};

var boss1 = new boss("nombre directivo 1","descripcion directivo 1","../images/t1.jpg","mail1","../");
var boss2 = new boss("nombre directivo 2","descripcion directivo 2","../images/t2.jpg","mail2","../");
var boss3 = new boss("nombre directivo 3","descripcion directivo 3","../images/t3.jpg","mail3","../");
var boss4 = new boss("nombre directivo 4","descripcion directivo 4","../images/t4.jpg","mail4","../");
var bosses = [boss1,boss2,boss3,boss4];

var archivement = function (name,description,type,link) {
    this.name = name;
    this.description = description;
    this.link = link;
    this.type = type; //degr ab-badge learn
};

var archivement1 = new archivement("nombre logro", "descripcion logro","degr" ,"../");
var archivement2 = new archivement("nombre logro", "descripcion logro","ab-badge","../");
var archivement3 = new archivement("nombre logro", "descripcion logro","learn","../");
var archivements = [archivement1,archivement2,archivement3];

var photo = function (id,title,description,link,src) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.link = link;
    this.src = src;
};

var photo1 = new photo("1","titulo","descripcion","../","../images/p1.jpg");
var photo2 = new photo("2","titulo","descripcion","../","../images/p2.jpg");
var photo3 = new photo("3","titulo","descripcion","../","../images/p3.jpg");
var photo4 = new photo("4","titulo","descripcion","../","../images/p4.jpg");
var photo5 = new photo("5","titulo","descripcion","../","../images/p5.jpg");
var photo6 = new photo("6","titulo","descripcion","../","../images/p6.jpg");
var photo7 = new photo("7","titulo","descripcion","../","../images/p7.jpg");
var photo8 = new photo("8","titulo","descripcion","../","../images/p8.jpg");
var photo9 = new photo("9","titulo","descripcion","../","../images/p9.jpg");
var photo10 = new photo("10","titulo","descripcion","../","../images/p10.jpg");
var photo11 = new photo("11","titulo","descripcion","../","../images/p11.jpg");
var photo12 = new photo("12","titulo","descripcion","../","../images/p12.jpg");

var gallery1 = [photo1,photo2,photo3,photo4];
var gallery2 = [photo5,photo6,photo7,photo8];
var gallery3 = [photo9,photo10,photo11,photo12];

var school = function(bosses,facilities,archivements,gallery,gallery2,gallery3){
    this.name = "Don Bosco";
    this.description = "Bienvenido  al campus  virtual  del  colegio  Don  Bosco";
    this.longdescription = "Pedir una Descripcion al colegio";
    this.location = "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d2757.866130704599!2d-58.279999273830086!3d-34.713400980922586!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1scolegio+don+bosco!5e0!3m2!1ses-419!2sar!4v1481164297313";
    this.street = "Belgrano 200";
    this.neighborhood = "Bernal";
    this.telNumber = "telefono del colegio";
    this.mail = "mail del colegio";
    this.facebook = "url del face";
    this.twitter = "url del twitter";
    this.archivements = archivements;
    this.bosses = bosses;
    this.facilitiesDescription = "descripcion de las instalaciones";
    this.facilities = facilities;
    this.galleryDescription = "descripcion galerias";
    this.gallery1 = gallery1;
    this.gallery2 = gallery2;
    this.gallery3 = gallery3;
};
school = new school(bosses,facilities,archivements,gallery1,gallery2,gallery3);

var page = function(){
    this.title = "Don Bosco Online";
    this.businessName = "Nombre de la empresa";
    this.businessPage = "../";
};
page = new page();

module.exports = {
    school: function () {
        return school;
    },
    page: function () {
        return page;
    },
};