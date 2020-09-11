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

        // db.collection('users').deleteOne(
        //     {_id: new ObjectID('5f4e8231d4dabe266ed07eb1')}
        // ).then((result) => {
        //     console.log('Deleted record count: '+result.deletedCount);
        // }).catch((error) => {
        //     console.log(error);
        // });

        db.collection('tasks').deleteMany(
            {completed: true}
        ).then((result) => {
            console.log('Deleted record count: '+result.deletedCount);
        }).catch((error) => {
            console.log(error);
        });
    }
);