var SchemArticles;
var articles;

module.exports = {
    start: function (db) {
        SchemArticles = db.Schema({title:String,
                                    content:String,
                                    author:String,
                                    imgAuthor:String});

        articles = db.model('article', SchemArticles);
    },

    newArticle: function (body) {
        var newArticle = new articles(body);
        newArticle.save()
    },

    getArticles: function(){
       return articles.find({});
    },

    findArticle: function (id) {
        return articles.find({_id:id});
    },

    deleteArticle: function(id){
        articles.findOne({_id: id}, function (err, article) {
            article.remove(function (err) {
                if (err) {
                    console.error('Error al borrar Articulo');
                }
            });
        });

    }
};

