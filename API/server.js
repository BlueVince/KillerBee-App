// Imports
const express = require('express');

const defaultRouter = require('./routers/router').router;
const connectionRouter = require('./routers/connectionRouter').router;

// Instantiate server
var server = express();

// Body Parser configuration
server.use(express.urlencoded({extended: true}));
server.use(express.json());

// Configure routes
server.use('/', defaultRouter);
server.use('/Connection/', connectionRouter);

// Launch server
server.listen(8080, function () {
    console.log('Server is listening');
});
