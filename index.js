require('dotenv').config();

var builder = require('botbuilder');
var restify = require('restify');
var request = require('request');
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

// 案件登録します。
function getAnken (message) {

	let options = {
		url: 'https://hgsym-iap.demo-mbp.com/imart/logic/api/create/anken',
		headers: {
			'Content-Type':'application/json'
		},
		json: true,
  		body: {
			"string1": message
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

// 申請します。
function getApply (message) {

 	var dt = new Date();
	var y = dt.getFullYear();
	var m = ("00" + (dt.getMonth()+1)).slice(-2);
	var d = ("00" + dt.getDate()).slice(-2);
	var date = y + "/" + m + "/" + d;
	
	let options = {
//		url: 'http://localhost:8081/imart/api/forma/imw/selectUnprocessActvMatterNodeList',
		url: 'https://hgsym-iap.demo-mbp.com/imart/api/forma/imw/apply',
		headers: {
			'Content-Type':'application/json'
		},
		json: true,
  		body: {
			"applyBaseDate": date,
			"matterName": "住所変更申請",
			"applyExecuteUserCode": "aoyagi",
			"userParam": {},
			"formaUserParam": {
				"items" : {
					"name" : "青柳",
					"date" : date,
					"Orgn" : "1-1",
					"bossname" : "上田",
					"address": message
				}
			},
			"applyAuthUserCode": "aoyagi",
			"flowId": "flow_script_06"
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

// ユーザーからのメッセージに反応する、ルートダイアログです。
bot.dialog('/', [
	session => {
		var response = session.message.text;
		if ( response.indexOf('案件登録') != -1) {
	   		// 下部にあるcreateankenダイアログに会話の制御を渡します。
			session.beginDialog('/createanken');
		}
		else if( response.indexOf('住所変更') != -1) {
	   		// 下部にあるapplyaddressダイアログに会話の制御を渡します。
			session.beginDialog('/applyaddress');
		}
		else if( response.indexOf('未処理一覧') != -1) {
	   		// 下部にあるunprocesslistダイアログに会話の制御を渡します。
			session.beginDialog('/unprocesslist');
		}
		else{
	   		// 下部にあるnoneダイアログに会話の制御を渡します。
			session.beginDialog('/none');
		}
	}
]);



// createankenダイアログ
bot.dialog('/createanken', [
	session => {
		builder.Prompts.text(session, "案件登録をしますので、工事名を教えてください");
	},
	(session, results) => {
		getAnken(results.response).then(
			data => {
				session.send('案件登録が完了しました。');
			},
			err => {
				session.send('%s', err);
			}
		);
		session.endDialog();
	}
]);



// unprocesslistダイアログ
bot.dialog('/unprocesslist', [
	session => {
		builder.Prompts.text(session, "未処理案件の一覧を表示したいユーザーを教えてください");
	},
	(session, results) => {
		getUnprocessActvMatterNodeList(results.response).then(
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
		session.endDialog();
	}
]);



// applyaddressダイアログ
bot.dialog('/applyaddress', [
	session => {
		builder.Prompts.text(session, "住所変更申請をしますので、新しい住所を教えてください");
	},
	(session, results) => {
		getApply(results.response).then(
			data => {
				session.send('【案件番号：%s】で申請しました', data.data.matterNumber);
			},
			err => {
				session.send('%s', err);
			}
		);
		session.endDialog();
	}
]);


// noneダイアログ
bot.dialog('/none', [
	session => {
		builder.Prompts.text(session, "案件登録、未処理一覧、住所変更のいずれかを入力してください");
		session.endDialog();
	}
]);

