var bocco = require('../lib/bocco');

var accessToken = 'ACCESS TOKEN';
var api = new bocco.ApiClient({accessToken: accessToken});

api.getRooms()
  .then(function(rooms) {
    rooms.forEach(function(room) {
      console.log(`${room.name}(${room.uuid}) にメッセージを送信中`);
      api.postTextMessage(room.uuid, 'API からメッセージを送信しました。');
    });
  })
  .catch(function(e) {
    console.log(`エラー発生: ${e}`);
  });
