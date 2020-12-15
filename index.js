// simple node.js application to receive data from clients and keep this data in memeory

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const {randomBytes} = require('crypto');
const measurements = {};
app.use(bodyParser.json());
const cors = require('cors'); 

// dynamic endpoints
var event_bus_endpoint = "http://localhost:4005";
if(process.env.EVENT_BUS_ENDPOINT){
    event_bus_endpoint = process.env.EVENT_BUS_ENDPOINT;
}

// will be invoked when a GET request is received
const axios = require('axios');
app.get('/values', (req,res)=>{
  // 001hs - when a get request is received send all data back to the requester and print 
  // it to console.log just for test purpose
  res.send(measurements);
});

// will be invoked when a post request is received - it means a new measurements is received from a device
app.post('/values',  async(req, res) =>{
    // 001hs generate a unique id for each new post request
    const id = randomBytes(4).toString('hex');
    
    // get the data from request body
    const { data } = req.body;
    const { devid} = req.body.data[0];
    // put the data into the data array with id as key
    measurements[id] = {
        id,data
    };
    console.log(measurements[id]);
    
    // send data to event bus
    await axios.post(event_bus_endpoint, {
        type: 'Measurement received',
        measurementdata: { 
            id,
            data
        } 
    });
    //  return status 201 to client and the data itself
    res.status(201).send(measurements[id]);
});

app.listen(4000, () =>{
    console.log(event_bus_endpoint)
    console.log('Listening on port 4000')
})