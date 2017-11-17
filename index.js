require('dotenv').config();

var builder = require('botbuilder');
var restify = require('restify');
var request = require('request');
var server = restify.createServer();

server.listen(3978, function () {
	console.log('%s listening to %s', server.name, server.url);
});
var connector = new builder.ChatConnector();
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// 未処理一覧を取得します。
function getUnprocessActvMatterNodeList (message) {

	let options = {
//		url: 'http://localhost:8081/imart/api/forma/imw/selectUnprocessActvMatterNodeList',
		url: 'https://hgsym-iap.demo-mbp.com/imart/api/forma/imw/selectUnprocessActvMatterNodeList',
		headers: {
			'Content-Type':'application/json'
		},
		json: true,
  		body: {
			'processAuthCondition': {
				'applyFlag': true,
				'approveFlag': true,
				'applyActFlag': true,
				'approveActFlag': true
			},
			'unprocessActvMatterNodeSearchCondition': {
				'baseUserCode': message,
				'listSearchCondition': {
					'offset': 0,
					'count': 0,
					'andCombinationFlag': true
				}
			}
		}
	};

    return new Promise((resolve, reject) => {
		process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; //https:自己証明書のとき必要？？
		request.post(options, function(error, response, body){
			if (!error && response.statusCode == 200) {
				console.log(body);
				resolve(body);
			} else {
				console.log('error: '+ response.statusCode);
				resolve(error);
			}
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
		getUnprocessActvMatterNodeList(response).then(
			data => {
				var misoyri = '';
				for (var item in data) {
					for (var subItem in data[item]) {
						misoyri = misoyri + '--------------------------------------------------\n\n';
						misoyri = misoyri + '案件名：' + data[item][subItem]['matterName'] + '\n\n';
						misoyri = misoyri + '申請者：' + data[item][subItem]['applyExecuteUserName'] + '\n\n';
						misoyri = misoyri + '申請日：' + data[item][subItem]['applyDate'] + '\n\n';
						misoyri = misoyri + 'ステータス：' + data[item][subItem]['status'] + '\n\n';
						misoyri = misoyri + '--------------------------------------------------\n\n\n\n';
					}
				}
				if(misoyri == ''){
					misoyri = '0件です。';
				}
				session.send('%s', misoyri);
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
		builder.Prompts.text(session, "こんにちは！未処理案件の一覧を表示したいユーザーを教えてください");
	},
	(session, results) => {
		// askダイアログを閉じ、ルートダイアログにユーザーからの返答データを渡します。
		session.endDialogWithResult(results);
	}
]);
