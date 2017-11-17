require('dotenv').config();

var builder = require('botbuilder');
var restify = require('restify');
var http = require('http');
var https = require('https');

var connector = new builder.ChatConnector({
	appId: process.env.MICROSOFT_APP_ID,
	appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var server = restify.createServer();
server.listen(process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
server.post('/api/messages', connector.listen());
var bot = new builder.UniversalBot(connector);


// ユーザーアカウント情報を取得します。
function getUserAccount (message) {
	var message = encodeURI(message);
	var URL='https://hgsym-iap.demo-mbp.com/imart/logic/api/sample/accounts?user_cd=' + message;
//	var URL='http://localhost:8081/imart/logic/api/sample/accounts?user_cd=' + message;
	return new Promise((resolve, reject) => {
		process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; //https:自己証明書のとき必要？？
		https.get(URL, (res) => {
//		http.get(URL, (res) => {
			let rawData = '';
			res.on('data', chunk => {
				rawData += chunk;
			});
			res.on('end', () => {
				resolve(JSON.parse(rawData));
			});
		}).on('error', err => {
			reject(err.message);
		});
	});
}

// ユーザーからの全てのメッセージに反応する、ルートダイアログです。
bot.dialog('/', [
	session => {
		// 下部にあるaskダイアログに会話の制御を渡します。
		session.beginDialog('/ask');
	},
	// askダイアログが閉じられると、制御がルートダイアログに戻り下記が実行されます。
	(session, results) => {
		var response = results.response;
		getUserAccount(response).then(
			data => {
				session.send('%s回です！', data.records[0].login_failure_count);
			},
			err => {
				session.send('%s', err);
			}
		);
	}
]);

// askダイアログ
bot.dialog('/ask', [
	session => {
		builder.Prompts.text(session, "こんにちは！どのユーザーのログイン失敗回数が知りたいですか？");
	},
	(session, results) => {
		// askダイアログを閉じ、ルートダイアログにユーザーからの返答データを渡します。
		session.endDialogWithResult(results);
	}
]);