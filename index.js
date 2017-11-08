'use strict';

var http = require('http');
var restify = require('restify'); // ローカル開発用のフレームワーク
var builder = require('botbuilder'); // Bot Builder SDK
var server = restify.createServer();

server.listen(3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector();
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

var API_KEY = 'f3502d594b68a566f92d483013bc6aa0';
//var URL = 'http://api.openweathermap.org/data/2.5/weather?q=Tokyo,JP&units=metric&appid=' + API_KEY;
//var URL = 'https://hgsym-iap.demo-mbp.com/imart/logic/api/sample/im-topics-to-log';
//var URL = 'http://hgsym-iap.demo-mbp.com/imart/logic/api/sample/im-topics-to-log';
var URL='http://ec2-13-115-215-14.ap-northeast-1.compute.amazonaws.com/imart/logic/api/sample/im-topics-to-log';
// 天気を取得します。
function getWeather () {
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
        var response = results.response.entity;
        getWeather().then(
        
    }
        
        
            data => {
				var data1 = data.topics;
				var title;
				var i;
				for (i in data1) {
					data1 = data[i];
					title = data1.title;
					session.send('タイトルは%sです！', title);
				}
            },
            err => {
                session.send('データを取得できませんでした！！');
            }
        );
    }
]);

// askダイアログ
bot.dialog('/ask', [
    session => {
        builder.Prompts.choice(session, "こんにちは！何が知りたいですか?", "気温|気圧|湿度");
    },
    (session, results) => {
        // askダイアログを閉じ、ルートダイアログにユーザーからの返答データを渡します。
        session.endDialogWithResult(results);
    }
]);