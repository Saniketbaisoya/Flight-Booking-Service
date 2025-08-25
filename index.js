const express = require('express');
const { serverConfig } = require('./src/config');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended : true}));




app.listen(serverConfig.PORT,() =>{
    console.log(`Successfully started the server on PORT : ${serverConfig.PORT}`);
})
