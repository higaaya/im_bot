require('dotenv').config();

var builder = require('botbuilder');
var restify = require('restify');

// auth for connector

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// making server

var server = restify.createServer();
server.listen(process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
server.post('/api/messages', connector.listen());

// making bot

var bot = new builder.UniversalBot(connector);
bot.dialog('/', function (session) {
    session.send('hey Hello World');
});

//higashiyama add
var request = require('request');

// URL
var baseUrl = 'https://hgsym-iap.demo-mbp.com/imart/logic/api/sample/im-topics-to-log';

request.post(
    {url: baseUrl, json:true},
    { form: { key: 'value', hoge: 'huga'} },
    function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var parse_body = qs.parse(body);
            console.log(body);
        } else {
          console.log(body);
        }   
    }   
);
