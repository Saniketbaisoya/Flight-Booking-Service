const express = require('express');
const { serverConfig } = require('./src/config');
const router = require('./src/routers/Router');
const scheduleCrons = require('./src/utils/common/cron-jobs.js');

 
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended : true}));

// http://localhost:2000/api
app.use('/api',router);


app.listen(serverConfig.PORT,() =>{
    console.log(`Successfully started the server on PORT : ${serverConfig.PORT}`);
    scheduleCrons();
})
