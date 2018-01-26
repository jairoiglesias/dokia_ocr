
/*
	Arquivo de conexão para o MongoDb da IBM referente ao Addon do Compose do Heroku
*/

var dbInstance = ''

module.exports = function(){

	if(dbInstance == ''){

		const MongoClient = require('mongodb').MongoClient

		// URL para conexão com o MongoDB do Compose.IO da IBM

		const url = 'mongodb://heroku:Z_XDWRucjB9UPoQiDCPkiGaa_EXavJvfRp944jMgkD6BwuWlkeIxfG_uDD_qyWj2t6l46Rgesgw8tm4Q4WNqPA@candidate.68.mongolayer.com:10543,candidate.21.mongolayer.com:11835/app79222204?replicaSet=set-5a38fa4133417bb451000e6c'

		const dbName = 'app79222204'

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