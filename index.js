'use strict';

var builder = require('botbuilder'); // Bot Builder SDK
var restify = require('restify'); // ローカル開発用のフレームワーク
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

var API_KEY = 'f3502d594b68a566f92d483013bc6aa0';
var URL = 'https://hgsym-iap.demo-mbp.com/imart/logic/api/sample/im-topics-to-log';

// intra-martニュースを取得します。
function getWeather () {
    return new Promise((resolve, reject) => {
		process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; //https:自己証明書のとき必要？？
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
		var response = results.response.entity;
		getWeather().then(
			data => {
				if (response === 'タイトル') {
					session.send('タイトルは%sです！', data.topics[0].title);
				} else if (response === 'リンク') {
					session.send('リンクは%sです！', data.topics[0].link);
				} else if (response === '日付') {
					session.send('日付は%sです！', data.topics[0].published);
				}
			},
			err => {
				session.send('intra-martニュースを取得できませんでした！！');
			}
		);
	}
]);

// askダイアログ
bot.dialog('/ask', [
	session => {
		builder.Prompts.choice(session, "こんにちは！intra-mart最新ニュースの何が知りたいですか?", "タイトル|リンク|日付");
	},
	(session, results) => {
		// askダイアログを閉じ、ルートダイアログにユーザーからの返答データを渡します。
		session.endDialogWithResult(results);
	}
]);