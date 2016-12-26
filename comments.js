var SchemComments;
var comments;

module.exports = {
    start: function (db) {
        SchemComments = db.Schema({name:String,
            comment:String,
            postId:String,
            likes:Number,
            dislikes:Number,
            votersPos:[String],
            votersNeg:[String]});
        comments = db.model('comment', SchemComments);
    },

    newComment: function (body) {
        var newComment = new comments(body);
        newComment.save();
    },

    getComments: function(id){
        return comments.find({postId:id});
    },

    deleteComments: function (id) {
      comments.find({postId:id}).remove().exec();
    },

    deleteComment: function (id) {
        comments.findOne({_id:id}).remove().exec();
    },

    voteComment: function (id,type,voter) {
        if (type == 0) {
            comments.findOne({_id: id,votersPos:voter}, function (err, com) {
                if(com) {
                    com.likes = com.likes - 1;
                    com.votersPos.remove(voter);
                    com.save(function (err) {
                        if (err) {
                            console.error('Error al dar like!');
                        }
                    });
                }else{
                    comments.findOne({_id: id}, function (err, com) {
                        com.likes = com.likes + 1;
                        com.votersPos.push(voter);
                        com.save(function (err) {
                            if (err) {
                                console.error('Error al dar dislike!');
                            }
                        });
                    });
                }
            });
        } else {
            comments.findOne({_id: id,votersNeg:voter}, function (err, com) {
                if(com) {
                    com.dislikes = com.dislikes - 1;
                    com.votersNeg.remove(voter);
                    com.save(function (err) {
                        if (err) {
                            console.error('Error al dar like!');
                        }
                    });
                }else{
                    comments.findOne({_id: id}, function (err, com) {
                        com.dislikes = com.dislikes + 1;
                        com.votersNeg.push(voter);
                        com.save(function (err) {
                            if (err) {
                                console.error('Error al dar dislike!');
                            }
                        });
                    });
                }
            });
        }
    }
};

