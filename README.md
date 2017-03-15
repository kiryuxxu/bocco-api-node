# bocco-api-node

コミュニケーションロボット BOCCO を操作するための [BOCCO API](http://api-docs.bocco.me)
を node.js から利用するためのライブラリです。

```node
const bocco = require('bocco');

let api = bocco.ApiClient('ACCESS TOKEN');

api.getRooms().then(function(rooms) {
    // 全ての部屋にメッセージを送る
    rooms.forEach(function(room) {
      api.postTextMessage(room.uuid, 'hello');
    });
  });
```


## サンプルコード

- [send_message.js](examples/send_message.js) -- 全ての部屋にメッセージを送信
- [ping_pong.js](examples/ping_pong.js) -- BOCCO から送信されたメッセージがキーワードに一致する場合に返信
