var bocco = require('../lib/bocco');

var api = new bocco.ApiClient('ACCESS TOKEN');

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
