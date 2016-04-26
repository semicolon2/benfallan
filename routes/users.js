var express = require('express');
var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/benfallan';
var User = {};

User.findOrCreate = function (profile, callback){
    mongoClient.connect(dbUrl, function (err, db){
        assert.equal(null, err);
        var usersCollection = db.collection('users');
        var cursor = usersCollection.find( {"googleId": profile.id} );
        cursor.each(function (err, doc) {
            assert.equal(err,null);
            if  (doc == null){
                usersCollection.insertOne({
                    "name":profile.displayName,
                    "googleid": profile.id,
                    "email": profile.emails.value,
                    "photo": profile.photos.value
                });
                db.close();
            }
            callback(err, doc);
        });
    });
};

User.getName = function () {
    
};

module.exports = User;
