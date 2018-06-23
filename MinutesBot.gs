var slack = {
  postUrl: 'https://slack.com/api/chat.postMessage',
  token: '', //Slackのtokenを入れる
  ChannelId: "minutes", //Botが投稿するSlackのチャンネル名
  userName: "minutesBot", //Botの名前
}

var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
var lastrow = sheet.getLastRow();
var lastcol = sheet.getLastColumn();
var sheetdata = sheet.getSheetValues(1, 1, lastrow, lastcol);

function MINUTES(){
  /*
    スプレッドシートのA列には抽選対象者（メンバー）の名前
    B列には絵文字（おまけ要素）
    C列にはそれぞれのメンバーの議事録担当回数が入っている。
    トリガーは時間。
    
    このBotは既に議事録担当が10回ほど決まったあとに導入したものなので、
    完全にランダムにしてしまうと、さらに担当回数に偏りが出てしまう可能性がある。
    だから、議事録の担当回数をスプレッドシートのC列に記載し、
    その値を考慮した上で再抽選を行うようにした。（後付け）
    
    また、人数が増減することはない。
  */
  
  //1番議事録書いてる人が何回書いてるのか数える
  var max = 0;
  for(var i = 1; i <= 13; i++){
    if(sheetdata[i][2] > max){
      max = sheetdata[i][2];
    }
  }
  Logger.log(max);
  
  //回数が最大値（max）と同じ人数を数える
  //全部で13人なので、全員同じ回数ずつやっていたらcountが13になる
  var count = 0;
  for(var i = 1; i <= 13; i++){
    if(sheetdata[i][2] == max){
      count++;
    }
  }
  
  //抽選部分
  var row;
  do {
    row = Math.floor(Math.random() * 13) + 1;
  } while(sheetdata[row][2] == max || count == 13);
  Logger.log(row);
  
  //抽選で決まった人の議事録担当回数を更新
  var getValue = sheetdata[row][2];
  sheet.getRange(row+1,3).setValue(getValue + 1);
  
  //抽選で決まった人の名前を取得
  var Name = sheetdata[row][0];
  
  //絵文字を適当に決める
  var row2 = Math.floor(Math.random() * 9) + 1;
  Logger.log(row2);
  var Emoji = sheetdata[row2][1];
  
  //チャンネルに結果を投稿
  var slackApp = SlackApp.create(slack["token"]);
  var Message = slackApp.postMessage(slack["ChannelId"], "今日の議事録担当は " + Name + " だよ！（" + (getValue + 1) + "回目）\nよろしくね！" + Emoji, {username : slack["userName"]});
  Logger.log(Message);
}
