import * as AWSMock from "aws-sdk-mock";
//import * as AWS from "aws-sdk"; 
//import { GetItemInput } from "aws-sdk/clients/dynamodb";

/*
beforeAll(async (done) => {
  //get requires env vars
  //done();
 });
 */

var describeImagesExample = require('../todos/DescribeImagesExample.js'),
AWS,
ec2;

AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: 'foo',
    secretAccessKey: 'bar',
    region: 'baz'
});
ec2 = new AWS.EC2({
  endpoint: new AWS.Endpoint('http://localhost:9090/')
});

describe("the module", () => {

  it('should return at least one pre-defined images', function(done) {
      describeImagesExample.describeImages(ec2, function getImages(images) {
          expect(images).to.have.length.above(0);
          // pick the first imageID for running the new instances
          exampleImageID = images[0].ImageId;
          done();
      });
  });

  it("should mock getItem from DynamoDB", async () => {

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB', 'getItem', (params, callback) => {
      console.log('DynamoDB', 'getItem', 'mock called');
      callback(null, {pk: "foo", sk: "bar"});
    })

    let input = { TableName: '', Key: {} };
    const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
    expect(await dynamodb.getItem(input).promise()).toStrictEqual( { pk: 'foo', sk: 'bar' });

    AWSMock.restore('DynamoDB');
  });

  it("should mock reading from DocumentClient", async () => {

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
      console.log('DynamoDB.DocumentClient', 'get', 'mock called');
      callback(null, {pk: "foo", sk: "bar"});
    })

    let input = { TableName: '', Key: {} };
    const client = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
    expect(await client.get(input).promise()).toStrictEqual( { pk: 'foo', sk: 'bar' });

    AWSMock.restore('DynamoDB.DocumentClient');
  });

});