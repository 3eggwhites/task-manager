const { MongoClient, ObjectID } = require('mongodb');
// used destructring to extract MongoClient and ObjectID properties from the mongodb object

const dbUrl = '<mongdbatlas-url>';
const databseName = 'task-manager';

MongoClient.connect(dbUrl, 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        poolSize: 2
    },
    (error, client) => {
    if (error) {
        return console.log('Unable to connect to database');
    }

    console.log('Connection successful');
    const id = new ObjectID();
    console.log(id);
    console.log(id.getTimestamp());
    
    const db = client.db(databseName); // Mongo automatically creates the database for us if not exists already.

    db.collection('users').insertOne({ // to create a collection in not exists already and insert one data.
        name: 'Ayan',
        age: 32
    }, (error, result) => {
        if (error) {
            return console.log('Unable to insert data');
        }

        console.log(result.ops);
    });

    //for adding id explicitly.

    db.collection('users').insertOne({ // to create a collection in not exists already and insert one data.
        _id: id,
        name: 'Explicit Id',
        age: 00
    }, (error, result) => {
        if (error) {
            return console.log('Unable to insert data');
        }

        console.log(result.ops);
    });

    db.collection('users').insertMany([{
        name: 'Buni',
        age: '20'
    },
    {
        name: 'Bou',
        age: 28
    }], (error,result) => {
        if (error) {
            return console.log('Unable to insert documents');
        }
        console.log(result.ops);
    });

    db.collection('tasks').insertMany(
        [
            {
                description: 'Task 1',
                completed: true
            },
            {
                description: 'Task 2',
                completed: false
            },
            {
                description: 'Task 3',
                completed: false
            }
        ]
    , (error,result) => {
        if (error) {
            return console.log('Unable to insert documents');
        }

        console.log(result.ops);
    });
});