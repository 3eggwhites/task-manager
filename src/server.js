const express = require('express');
const { ObjectID } = require('mongodb');

// to ensure mongoose db connection is activated
require('./db/mongoose');
const taskRouter = require('./routers/task-router');
const userRouter = require('./routers/user-router');

const app = express();

const port = process.env.PORT;

// app.use((req, res, next) => {
//     res.status(503).send('Services are unser maintenance');
// });

// to automatically parse incoming json to an object. if not done then req.body won't work
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

// heatlthcheck endpoint
app.get('/health',(req,res) => {
    res.send('OK');
});

app.listen(port,() => {
    console.log('server is up at '+port);
});
