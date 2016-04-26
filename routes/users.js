var express = require('express');
var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/benfallan';
var User = {};

User.findOrCreate = function (profile, callback){
    mongoClient.connect(dbUrl, function (err, db){
        assert.equal(null, err);
        var usersCollection = db.collection('users');
        var cursor = usersCollection.find( {"googleId": googleId} );
        cursor.each(function (err, doc) {
            assert.equal(err,null);
            if  (doc != null){
                usersCollection.insertOne({
                    "name":profile.name,
                    "googleid": profile.id,
                })
            } else {

            }
        });
    });
};

module.exports = User;
