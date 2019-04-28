
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:32773/";

/**
 * mongodb > dbo === db > collection
 *
 * Singleton mongoclient connection instance
 */
let mongodbInstance = null;

exports.getDb = async function (dbName) {
  return await new Promise(resolve => {

    if (mongodbInstance) {
      resolve(mongodbInstance.db(dbName));
    } else {
      MongoClient.connect(url, { useNewUrlParser: true }, function (err, mongodb) {
        // Save the mongodb instance
        mongodbInstance = mongodb;

        if (err) throw err;

        resolve(mongodbInstance.db(dbName));
      });
    }
  })
};

exports.close = function () {
  mongodbInstance.close();
  mongodbInstance = null;
}

exports.findExample = async function (db, collection) {
  return await new Promise(resolve => {
    db.collection(collection).findOne({}, function (err, result) {
      if (err) throw err;
      console.log(result.name);
    });
  })
};

