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
            return console.log('Unable to connect');
        }

        const db = client.db(databseName);

        const updatePromise = db.collection('users').updateOne(
            {_id: new ObjectID('5f50d94af5d1333ace30fb93')},
            {
                $set: {
                    name: 'Krishan'
                }
            }
        );

        updatePromise.then((result) => {
            console.log(result);
        }).catch((error) => {
            console.log(error);
        });

        db.collection('users').updateOne(
            {_id: new ObjectID('5f50d94af5d1333ace30fb93')},
            {
                $inc: {
                    age: 2
                }
            }
        ).then((result) => {
            console.log(result);
        }).catch((error) => {
            console.log(error);
        });

        db.collection('tasks').updateMany(
            {completed: false},
            {
                $set: {
                    completed: true
                }
            }
        ).then((result) => {
            console.log(result);
        }).catch((error) => {
            console.log(error);
        });
    }
);