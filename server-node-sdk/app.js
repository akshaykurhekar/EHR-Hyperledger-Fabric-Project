'use strict';

const express = require('express');
const helper = require('./helper');
const invoke = require('./invoke');
const query = require('./query');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.listen(5000, function () {
    console.log('Node SDK server is running on 5000 port :) ');
});

app.get('/status', async function (req, res, next) {
    res.send("Server is up.");
})


app.post('/registerPatient', async function (req, res, next) {
    try {
        let role; 
        let {adminId, doctorId, userId, name, dob, city} = req.body;

        // check request body
        console.log("Received request:", req.body);
        if (req.body.userId && req.body.adminId) {
            userId = req.body.userId;
            
            adminId = req.body.adminId;
        } else {
            console.log("Missing input data. Please enter all the user details.");
            throw new Error("Missing input data. Please enter all the user details.");
        }
        
        role='patient';

        //call registerEnrollUser function and pass the above as parameters to the function
        const result = await helper.registerUser(adminId, doctorId, userId, role, { name, dob, city});
        console.log("Result from user registration function:", result);

        // check register function response and set API response accordingly 
        res.status(200).send(result);
    } catch (error) {
        console.log("There was an error while registering the user. Error is ", error);
        next(error);
    }  
});

app.post('/loginPatient', async function (req, res, next){
    try {
        let userId;

        // check request body        
        if (req.body.userId) {
            userId = req.body.userId;
            
        } else {
            console.log("Missing input data. Please enter all the user details.");
            throw new Error("Missing input data. Please enter all the user details.");
        }

        const result = await helper.login(userId);
        console.log("Result from user login function: ", result);
        //check response returned by login function and set API response accordingly
        res.status(200).send(result);
    } catch (error) {
        console.log("There was an error while logging in. Error is ", error);
        next(error);
    }

});


app.post('/queryHistoryOfAsset', async function (req, res, next){
    try {
        //  queryHistory(ctx, Id)
        let userId = req.body.userId;
        let recordId = req.body.recordId;
      
        const result = await query.getQuery('queryHistoryOfAsset',{recordId}, userId);
        // console.log("Response from chaincode", result);
        //check response returned by login function and set API response accordingly
        res.status(200).send(JSON.parse(result.data));
    } catch (error) {       
        next(error);
    }
});


app.post('/addRecord', async function (req, res, next){
    try {
        //  Only doctors can add records
        const {userId, patientId, diagnosis, prescription} = req.body;
        const result = await invoke.invokeTransaction('addRecord', {patientId, diagnosis, prescription}, userId);
              
        res.send({sucess:true, data: result})
                
    } catch (error) {       
        next(error);
    }
});


app.post('/getAllRecordsByPatientId', async function (req, res, next){
    try {
        // getAllRecordsByPatientId(ctx, patientId
        const {userId, patientId} = req.body;  
        const result = await query.getQuery('getAllRecordsByPatientId',{patientId}, userId);

        console.log("Response from chaincode", result);
        res.status(200).send({ success: true, data:result});

    } catch (error) {       
        next(error);
    }
});

app.post('/getRecordById', async function (req, res, next){
    try {
        // getRecordById(ctx, patientId, recordId)
        const {userId, patientId, recordId} = req.body;  
        const result = await query.getQuery('getRecordById',{patientId, recordId}, userId);

        console.log("Response from chaincode", result);
        res.status(200).send({ success: true, data:result});

    } catch (error) {       
        next(error);
    }
});

app.post('/grantAccess', async function (req, res, next){
    try {
        // call this from patient 
        // grantAccess(ctx, patientId, doctorIdToGrant) - call by patient
        const {userId, patientId, doctorIdToGrant} = req.body;  
        const result = await invoke.invokeTransaction('grantAccess',{patientId:patientId, doctorIdToGrant:doctorIdToGrant}, userId);

        console.log("Response from chaincode", result);
        res.status(200).send({ success: true, data:result});

    } catch (error) {       
        next(error);
    }
});

// create Faucet Wallet only admin can call.
// fetchLedger(ctx, timeStamp, amount, timeDelay)
app.post('/fetchLedger', async function (req, res, next){
    try {
        let userId = req.body.userId;
        // fetchLedger(ctx)
        const result = await query.getQuery('fetchLedger', {}, userId);
        console.log("Response from chaincode", result);
        //check response returned by login function and set API response accordingly
            res.status(200).send({ success: true, data:result})

    } catch (error) {       
        next(error);
    }
});


app.use((err, req, res, next) => {
    res.status(400).send(err.message);
})
