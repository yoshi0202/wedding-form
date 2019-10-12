var AWS = require("aws-sdk");
var dynamo = new AWS.DynamoDB.DocumentClient({
    region: "ap-northeast-1"
});
exports.handler = async event => {
    let pArray = event.body.split("&");
    let requestParams = {};
    pArray.map(function(val, index) {
        let arr = val.split("=");
        requestParams[arr[0]] = arr[1];
    });
    console.log(`requestParams:${requestParams}`);
    let dynamoParams = {
        TableName: "wedding-dynamodb"
    };
    let response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
        }
    };
    if (requestParams.pageParam === "update") {
        //button click => update
        dynamoParams = {
            ...dynamoParams,
            Key: {
                id: requestParams.id
            },
            UpdateExpression: "set flg = :f",
            ExpressionAttributeValues: {
                ":f": requestParams.status
            }
        };
        console.log(`dynamoParams:${dynamoParams}`);
        const data = await dynamo
            .update(dynamoParams, function(err, data) {
                if (err) {
                    response.body = JSON.stringify(err);
                } else {
                    response.body = JSON.stringify(data);
                }
            })
            .promise();
    } else {
        //page loading => init
        const data = await dynamo.scan(dynamoParams).promise();
        response.body = JSON.stringify(data);
    }
    return response;
};
