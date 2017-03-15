const bocco = require('../lib/bocco');


const API_KEY = 'API KEY';


new bocco.ApiClient(API_KEY)
  .getRooms()
  .then(function(rooms) {
    rooms.forEach(function(room) {
      console.log(`${room.name}(${room.uuid}) にメッセージを送信中`);
      api.postTextMessage(room.uuid, 'API からメッセージを送信しました。');
    });
  })
  .catch(function(e) {
    console.log(`エラー発生: ${e}`);
  });
