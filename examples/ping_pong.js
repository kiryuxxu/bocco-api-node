const bocco = require('../lib/bocco');


const ACCESS_TOKEN = 'ACCESS TOKEN';
const ROOM_UUID = 'ROOM UUID';
const KEYWORDS = ['おはよう', 'おやすみ', 'こんにちは', 'こんばんは'];


let api = new bocco.ApiClient(ACCESS_TOKEN);


api.createSubscription(ROOM_UUID)
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
      KEYWORDS.forEach(function(keyword) {
        if (message.body.text.includes(keyword)) {
          console.log('返信中...');
          api.postTextMessage(ROOM_UUID, message.body.text);
        }
      });
    });
  })
  .on('error', function(e) {
    console.log(e);
  })
  .start();

