'use strict';

var builder = require('botbuilder'); // Bot Builder SDK
var restify = require('restify'); // ローカル開発用のフレームワーク
var http = require('http');
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

// メールを送信します。
function sendMail (message) {
	var message = encodeURI(message);
	var URL='http://hgsym-iap.demo-mbp.com/imart/logic/api/tutorial/flow?message=' + message;
	return new Promise((resolve, reject) => {
		http.get(URL, (res) => {
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
		sendMail(response).then(
			data => {
				session.send('(「%s」を送信しました。', response);
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
		builder.Prompts.text(session, "こんにちは！どのような内容をメール送信しますか？");
	},
	(session, results) => {
		// askダイアログを閉じ、ルートダイアログにユーザーからの返答データを渡します。
		session.endDialogWithResult(results);
	}
]);