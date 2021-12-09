const AWS  = require('aws-sdk'); 
const bluebird = require('bluebird'); 

const EC2_TOPIC_ARN = process.env.EC2_TOPIC_ARN; 
const DEFAULT_FILTERS = {}; 

AWS.config.setPromisesDependency(bluebird); 

var ec2 = new AWS.EC2(); 
var sns = new AWS.SNS(); 

/** 
* Describes EC2 instances 
* 
*/ 
var getEC2Instances = (filters) => { 
    var params = { 
     DryRun : false, 
     Filters: [filters] 
    }; 

    return ec2.describeInstances(params).promise(); 
} 

/** 
* Publishes a message to the sns topic 
* 
*/ 
var broadcast = (message) => { 
    var params = { 
     TargetArn: EC2_TOPIC_ARN, 
     Message : JSON.stringify(message), 
     Subject : 'EC2 Describe Event' 
    }; 

    return sns.publish(params).promise(); 
} 

module.exports.handler = (event, context, callback) => { 
    var body = JSON.parse(event.body); 
    var filters = body.filters || DEFAULT_FILTERS; 

    getEC2Instances(filters) 
     .then(
      (result) => { 
       console.log(result); 

       broadcast(result) 
        .then((status) => console.log(status)) 
        .catch((error) => console.error(error)); 

       callback(null, { statusCode: 200, body: JSON.stringify(result) }); 
      } 
     ).catch(
      (error) => { 
       console.error(error); 
       callback(null, { statusCode: 500, body: JSON.stringify({message: 'Ops'}) });     
      } 
    ); 
} 