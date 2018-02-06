
/*
	Arquivo de conexão para o MongoDb da IBM referente ao Addon do Compose do Heroku
*/

var dbInstance = ''

module.exports = function(){

	if(dbInstance == ''){

		const MongoClient = require('mongodb').MongoClient

		const url = process.env.MONGODB_URI ||'mongodb://heroku_7gq7kskf:h87b2kq3n2oj5ffoin790mrrf3@ds125068.mlab.com:25068/heroku_7gq7kskf'

		const dbName = 'heroku_7gq7kskf'

		MongoClient.connect(url, function(err, client) {
		
			if(err) throw err

			console.log("Connected successfully to MongoDb");
		
			const db = client.db(dbName);

			dbInstance = db

		//   client.close();

			// TESTE
			// const collection = db.collection('organizations')

			// collection.find().limit(5).toArray(function(err, result){
			// 	if(err) throw err

			// 	console.log(result)
			// })

		})
	}

	return dbInstance

}