'use strict';
 
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
  	databaseURL: 'ws://chatbot-283717.firebaseio.com//'
});
 
process.env.DEBUG = 'dialogflow:debug';  
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  //var db = admin.database();
  //var ref = db.ref("server/saving-data/fireblog");
  
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function addorder(agent){
    const pizzatype = agent.parameters.pizzatype;
    const pizzasize = agent.parameters.pizzasize;
    const pizzatoppings = agent.parameters.pizzatoppings;
    const orderid = Math.floor((Math.random() * 9999) + 1000);
    const customername = agent.parameters.name;
    const customerphone = agent.parameters.phoneno;
    const customeraddress = agent.parameters.address;
    //var postsRef = ref.child("data");
    //var newPostRef = postsRef.push();
    
    agent.add(`Your order id is ${orderid}. Great choice ${customername}..!! Type "Order status" to know your Order Status`);  
    return admin.database().ref('data').set({
    	pizzatype: pizzatype,
      	pizzasize: pizzasize,
      	pizzatoppings: pizzatoppings,
        orderid: orderid,
        name: customername,
        phoneno : customerphone,
        address: customeraddress
    });
    
  }
  function vieworderbyid(agent){
    const inputoid = agent.parameters.orderid;
    return admin.database().ref('data').once('value').then((snapshot)=>{
    const oid = snapshot.child('orderid').val();
    const cname = snapshot.child('name').val();
      if(oid==inputoid){
        agent.add(`Your OrderID is ${oid}. Your Delicious Pizza is prepared, Get ready to Get your Order ${cname}`);
      }
       else 
        agent.add(`Can you please Enter your OrderID again`); 
    });
  }
  
  let intentMap = new Map();
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('UserDetails', addorder);
  intentMap.set('OrderDetails', vieworderbyid);
  agent.handleRequest(intentMap);
});
