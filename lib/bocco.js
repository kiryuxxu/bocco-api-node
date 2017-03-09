var request = require('request-promise'),
  uuid = require('node-uuid'),
  util = require('util'),
  EventEmitter = require('events').EventEmitter;


function ApiClient(accessToken) {
  EventEmitter.call(this);
  this.accessToken = accessToken;
  this.baseUri = 'https://api.bocco.me/alpha';
  this.headers = {'Accept-Language': 'ja'};
}
util.inherits(ApiClient, EventEmitter);


ApiClient.prototype.apiRequest = function(params) {
  params.uri = this.baseUri + params.path;
  params.headers = this.headers;
  params.json = (params.json === undefined) ? true : params.json;
  if (params.method == 'GET') {
    params.qs = (params.qs === undefined) ? {} : params.qs;
    params.qs.access_token = this.accessToken;
  } else {
    params.form = (params.form === undefined) ? {} : params.form;
    params.form.access_token = this.accessToken;
  }
  return request(params);
}


ApiClient.prototype.createSubscription = function(roomUuid) {
  var self = this;
  return new RoomSubscription(roomUuid, function(uuid, lastMessageId) {
    return self.subscribeMessages(roomUuid, lastMessageId);
  });
}


ApiClient.prototype.postTextMessage = function(roomUuid, text) {
  return this.apiRequest({
    method: 'POST',
    path: `/rooms/${roomUuid}/messages`,
    form: {
      unique_id: uuid.v4(),
      media: 'text',
      text: text
    }
  });
};


ApiClient.prototype.subscribeMessages = function(roomUuid, newerThan=0) {
  return this.apiRequest({
    method: 'GET',
    path: `/rooms/${roomUuid}/subscribe`,
    qs: {
      newer_than: newerThan
    }
  });
};


ApiClient.prototype.getRooms = function() {
  return this.apiRequest({
    method: 'GET',
    path: '/rooms/joined'
  });
};


function RoomSubscription(roomUuid, fn) {
  EventEmitter.call(this);
  this.uuid = roomUuid;
  this.fn = fn;
  this.lastMessageId = 0;
  this.deferred = null;
  this.timeout = null;
  this.running = false;
  this.retryInterval = 5000;
}
util.inherits(RoomSubscription, EventEmitter);


RoomSubscription.prototype.start = function() {
  if (this.running) {
    return this;
  }
  this.run();
  return this;
};


RoomSubscription.prototype.stop = function() {
  if (!this.running) {
    return;
  }
  if (this.deferred) {
    this.deferred.cancel();
  }
  if (this.timeout) {
    clearTimeout(this.timeout);
  }
};


RoomSubscription.prototype.run = function() {
  var self = this;
  try { 
    this.emit('request', this.uuid, this.lastMessageId);
    this.deferred = this.fn(this.uuid, this.lastMessageId)
      .then(function(messages) {
        if (self.lastMessageId != 0) {
          self.emit('messages', messages);
        };
        messages.forEach(function(message) {
          if (message.event == 'message') {
            self.lastMessageId = message.body.id;
          }
        });
        self.retry();
      })
      .catch(function(e) {
        if (e.statusCode != 408) {  // timeout
          self.emit('error', e);
        }
        self.retry();
      });
  } catch (e) {
    self.emit('error', e);
    self.retry();
  }

};


RoomSubscription.prototype.retry = function() {
  var self = this;
  setTimeout(function() {
    self.run();
  }, this.retryInterval);
};


exports.ApiClient = ApiClient;
