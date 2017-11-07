var restify = require('restify');
var builder = require('botbuilder');
 
//=========================================================
// Bot Setup
//=========================================================
 
// APIサーバーの作成
var server = restify.createServer();
 
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});
 
// Chat botの作成
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
 
server.post('/api/messages', connector.listen());
 
//=========================================================
// Bots Dialogs
//=========================================================
// メッセージの処理
bot.dialog('/', function (session) {
    session.send(session.message.text);
});