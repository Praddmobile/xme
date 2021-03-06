var ObjectId = require("mongodb").ObjectID,
    https = require('https'),
    async = require('async'),
	_ = require('lodash'),
    errors = require('http-custom-errors');


exports.get = function(req, res,next) {
    console.log('get contacts');
    var id = new ObjectId(req.user.id);
    console.log(id);
    req.db.collection('users').findOne({_id:new ObjectId(id)},function(err, doc){
        if(err) return next(errors.InternalServerError(err.message));

        req.db.collection('users').find({nick:{$in:doc.contacts || []}}).toArray(function(err,docs){
            var contacts = docs.map(function(d){
                var res= _.indexOf(doc.blackList, d.nick);
                return {id:d.id, pic: d.pic, nick: d.nick, firstName: d.firstName, lastName: d.lastName,type: d.type,blocked:res>=0};
            });

            res.send(contacts);
        })
    });
}

exports.addContact = function(req,res,next){
    var id = new ObjectId(req.user.id);
    req.db.collection('users').update({_id:id},{$addToSet:{contacts:req.params.username}},function(err,result){
        if(err) return next(errors.InternalServerError(err.message));
        res.status(204).send()
    });
}


exports.lockContact = function(req,res,next){
    var id = new ObjectId(req.user.id);
    req.db.collection('users').update({_id: id},{$addToSet:{blackList:req.params.username}},function(err,result){
        if(err) return next(errors.InternalServerError(err.message));
        res.status(204).send();
    });
}

exports.unlockContact = function(req,res,next){
    var id = new ObjectId(req.user.id);
    req.db.collection('users').update({_id: id},{$pull:{blackList:req.params.username}},function(err,result){
        if(err) return next(errors.InternalServerError(err.message));
        res.status(204).send();
    });

}
exports.createAppeal = function(req,res,next){
    res.status(204).send();
}
