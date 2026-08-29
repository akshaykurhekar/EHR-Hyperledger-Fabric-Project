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
    console.log('Node server is running on 5000 port :) ');
});

app.get('/status', async function (req, res, next) {
    res.send("Server is up");
} )

app.post('/initCC', async function (req, res, next) {
    const {userId} = req.body;
    const result = await invoke.invokeTransaction('InitLedger', userId);
    return { success:true, data: result };
})


app.post('/registerUser', async function (req, res, next) {
    try {
        let userId, customRole, orgID;

        // check request body
        console.log("Received request: ", req.body);
        if (req.body.userId && req.body.role) {
            userId = req.body.userId;
            
            customRole = req.body.role;
        } else {
            console.log("Missing input data. Please enter all the user details.");
            throw new Error("Missing input data. Please enter all the user details.");
        }
        orgID = req.body.orgID ? req.body.orgID : 'Org1';

        //call registerEnrollUser function and pass the above as parameters to the function
        const result = await helper.registerUser(userId, customRole);
        console.log("Result from user registration function:", result);

        // check register function response and set API response accordingly 
        res.status(200).send(result);
    } catch (error) {
        console.log("There was an error while registering the user. Error is ", error);
        next(error);
    }  
});

app.post('/userLogin', async function (req, res, next){
    try {
        let userId, orgID;

        // check request body        
        if (req.body.userId) {
            userId = req.body.userId;
            
        } else {
            console.log("Missing input data. Please enter all the user details.");
            throw new Error("Missing input data. Please enter all the user details.");
        }
        orgID = req.body.orgID ? req.body.orgID : 'Org1';

        const result = await helper.login(userId, orgID);
        console.log("Result from user login function: ", result);
        //check response returned by login function and set API response accordingly
        res.status(200).send(result);
    } catch (error) {
        console.log("There was an error while logging in. Error is ", error);
        next(error);
    }

});

// query history of asset
app.post('/queryHistoryOfAsset', async function (req, res, next){
    try {
        //  queryHistory(ctx, Id)
        let userId = req.body.userId;
        let Id = req.body.Id;
      
        const result = await query.getQuery('queryHistoryOfAsset',{assetId:Id}, userId);
        console.log("Response from chaincode", result);
        //check response returned by login function and set API response accordingly
        res.status(200).send(JSON.parse(result.data));
    } catch (error) {       
        next(error);
    }
});

//queryWallet to getBalance 
app.post('/createRecord', async function (req, res, next){
    try {
        //  getBalance(ctx, walletId)
        const {id, userId, createdBy, title, details} = req.body;
        // const result = await helper.getBalance(walletId);
        const result = await invoke.invokeTransaction('CreateAsset', {id, createdBy, title, details}, userId);
        
        if(result.success){
            res.send({sucess:true, data: JSON.parse(result.data)})
        }else{
            res.status(500).send({sucess:false, message: result.message})
        }
        
    } catch (error) {       
        next(error);
    }
});

// query Ledger
app.post('/ReadAsset', async function (req, res, next){
    try {
        // queryAllAssets(ctx)
        const {userId, id} = req.body;  
        const result = await query.getQuery('ReadAsset',{id}, userId);

        console.log("Response from chaincode", result);
        //check response returned by login function and set API response accordingly
        // if(result.success){
        // }else{
            
        //     res.status(500).send({sucess:false, message:result});
            
        // }
        res.status(200).send({ success: true, data:result});

    } catch (error) {       
        next(error);
    }
});

// requestToken(ctx, userId, timeStamp)  
app.post('/requestToken', async function (req, res, next){
    try {
        // queryAllAssets(ctx)
        let userId = req.body.userId;
        const timeStamp = new Date().getTime();  
        const result = await invoke.invokeTransaction('requestToken',{userId:userId, timeStamp:timeStamp}, userId);
        console.log("Response from chaincode", result);
        //check response returned by login function and set API response accordingly
        if(result.status){
            res.status(200).send(JSON.parse(result.message));
        }else{
            res.status(200).send(JSON.parse(result.message));
        }
    } catch (error) {       
        next(error);
    }
});

// create Faucet Wallet only admin can call.
// setFaucetWallet(ctx, timeStamp, amount, timeDelay)
app.post('/setFaucetWallet', async function (req, res, next){
    try {
        // queryAllAssets(ctx)
        let userId = req.body.userId;
        let amount = req.body.amount;
        let timeDelay = req.body.timeDelay; // 8640000 OR 180000 in millisecond
        const timeStamp = new Date().getTime();  
        const result = await invoke.invokeTransaction('setFaucetWallet',{amount:amount, timeDelay:timeDelay,timeStamp:timeStamp}, userId);
        console.log("Response from chaincode", result);
        //check response returned by login function and set API response accordingly
        if(result.status){
            res.status(200).send(result.message);
        }else{
            res.status(200).send(result.message);
        }

    } catch (error) {       
        next(error);
    }
});

// getFaucetBalance
app.post('/faucetBalance', async function (req, res, next){
    try {
        // queryAllAssets(ctx)
        let userId = req.body.userId;
        const result = await query.getQuery('faucetBalance',{}, userId);
        console.log("Response from chaincode", result);
        //check response returned by login function and set API response accordingly
        if(result.status){
            res.status(200).send(JSON.parse(result));
        }else{
            res.status(200).send(JSON.parse(result));
        }
    } catch (error) {       
        next(error);
    }
});

// setAlphaToken
app.post('/setToken', async function (req, res, next){
    try {        
        let userId = req.body.userId;
        const result = await invoke.invokeTransaction('setToken',{}, userId);
        console.log("Response from chaincode", result);
        //check response returned by login function and set API response accordingly
        if(result.status){
            res.status(200).send(JSON.parse(result.message));
        }else{
            res.status(200).send(JSON.parse(result.message));
        }
    } catch (error) {       
        next(error);
    }
});

// getTotalSupply
app.post('/getTotalSupply', async function (req, res, next){
    try {       
        let userId = req.body.userId;
        const result = await query.getQuery('getTotalSupply',{}, userId);
        console.log("Response from chaincode", result);
        if(result.status){
            res.status(200).send(JSON.parse(result));
        }else{
            res.status(200).send(JSON.parse(result));
        }
    } catch (error) {       
        next(error);
    }
});

// getTokenName
app.post('/getTokenName', async function (req, res, next){
    try {       
        let userId = req.body.userId;
        const result = await query.getQuery('getTokenName',{}, userId);
        console.log("Response from chaincode", result);
        if(result.status){
            res.status(200).send(JSON.parse(result));
        }else{
            res.status(200).send(JSON.parse(result));
        }
    } catch (error) {       
        next(error);
    }
});

// getTokenSymbol
app.post('/getTokenSymbol', async function (req, res, next){
    try {       
        let userId = req.body.userId;
        const result = await query.getQuery('getTokenSymbol',{}, userId);
        console.log("Response from chaincode", result);
        if(result.status){
            res.status(200).send(JSON.parse(result));
        }else{
            res.status(200).send(JSON.parse(result));
        }
    } catch (error) {       
        next(error);
    }
});

// getTokenDecimals
app.post('/getTokenDecimals', async function (req, res, next){
    try {       
        let userId = req.body.userId;
        const result = await query.getQuery('getTokenDecimals',{}, userId);
        console.log("Response from chaincode", result);
        if(result.status){
            res.status(200).send(JSON.parse(result));
        }else{
            res.status(200).send(JSON.parse(result));
        }
    } catch (error) {       
        next(error);
    }
});

//mintToken
app.post('/mintToken', async function (req, res, next){
    try {       
        let userId = req.body.userId;
        const amount = req.body.amount;
        const result = await query.getQuery('mintToken', {amount:amount}, userId);
        console.log("Response from chaincode", result);
        if(result.status){
            res.status(200).send(JSON.parse(result));
        }else{
            res.status(200).send(JSON.parse(result));
        }
    } catch (error) {       
        next(error);
    }
});

//transferToken
app.post('/transferToken', async function (req, res, next){
    try {       
        let userId = req.body.userId;
        const receiver = req.body.receiver;
        const amount = req.body.amount;
        const result = await query.getQuery('transferToken',{receiver:receiver,amount:amount}, userId);
        console.log("Response from chaincode", result);
        if(result.status){
            res.status(200).send(JSON.parse(result));
        }else{
            res.status(200).send(JSON.parse(result));
        }
    } catch (error) {       
        next(error);
    }
});

app.use((err, req, res, next) => {
    res.status(400).send(err.message);
})
