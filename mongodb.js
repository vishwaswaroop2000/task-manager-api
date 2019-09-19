const { MongoClient, ObjectID } = require('mongodb') //Mongo Client gives access to functions necessary to perform basic CRUD operations
const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

const id = new ObjectID()

//connect to server
MongoClient.connect(connectionURL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
  if (error)
    return console.log("Unable to connect to database")

  const db = client.db(databaseName)//Create a database if not already created.

})

