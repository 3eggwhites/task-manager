const app = require('./expressapp')

const port = process.env.PORT;

app.listen(port,() => {
    console.log('server is up at '+port);
});
