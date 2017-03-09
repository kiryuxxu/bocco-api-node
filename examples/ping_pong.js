var bocco = require('../lib/bocco');

var accessToken = 'ACCESS TOKEN';
var roomUuid = 'ROOM UUID';
var api = new bocco.ApiClient({accessToken: accessToken});
var keywords = ['おはよう', 'おやすみ', 'こんにちは', 'こんばんは'];

api.createSubscription(roomUuid).start()
  .on('request', function(uuid, lastMessageId) {
    console.log(`request ${uuid} ${lastMessageId}`);
  })
  .on('messages', function(messages) {
    messages.forEach(function(message) {
      if (message.event != 'message') {
        return;
      }
      console.log(message.body.text);
      if (message.body.user.user_type != 'bocco') {
        return;
      }
      keywords.forEach(function(keyword) {
        if (message.body.text.includes(keyword)) {
          console.log('返信中...');
          api.postTextMessage(roomUuid, message.body.text);
        }
      });
    });
  })
  .on('error', function(e) {
    console.log(e);
  });

