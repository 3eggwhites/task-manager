const mongoose = require('mongoose');

mongoose.connect('mongo-prod',
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        poolSize: 2,
        useUnifiedTopology: true
    }
);