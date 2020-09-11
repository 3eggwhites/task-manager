const { MongoClient, ObjectID } = require('mongodb');

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

        const db = client.db(databseName);

        db.collection('users').findOne({
            _id: new ObjectID("5f4e8231d4dabe266ed07eb1")
        }, (error,user) => {
            if (error) {
                return console.log('Unable to fetch');
            }

            console.log(user);
        });

        db.collection('tasks').find({completed: false}).toArray((error,tasks) => {
            console.log(tasks);
        });

        db.collection('tasks').find({completed: false}).count((error,count) => {
            console.log(count);
        });

        db.collection('tasks').findOne({
            _id: new ObjectID("5f4e7a4cdec01a21fc961a05")
        }, (error,task) => {
            console.log(task);
        });
    }
);