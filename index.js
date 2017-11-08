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

var API_KEY = 'f3502d594b68a566f92d483013bc6aa0';
var URL = 'http://api.openweathermap.org/data/2.5/weather?q=Tokyo,JP&units=metric&appid=' + API_KEY;

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
            data => {
                if (response === '気温') {
                    session.send('気温は%s°です！', Math.round(data.main.temp));
                } else if (response === '気圧') {
                    session.send('気圧は%shpaです！', data.main.pressure);
                } else if (response === '湿度') {
                    session.send('湿度は%s％です！', data.main.humidity);
                }
            },
            err => {
                session.send('天気を取得できませんでした！！');
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