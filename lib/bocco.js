'use strict'
const
  request = require('request-promise'),
  Promise = require('promise'),
  uuid = require('node-uuid'),
  util = require('util'),
  {EventEmitter} = require('events');


const DEFAULT_HEADERS = {'Accept-Language': 'ja'}
const BASE_URI = 'https://api.bocco.me/alpha';


class ApiClient extends EventEmitter {

  constructor(accessToken) {
    super();
    this.accessToken = accessToken;
    this.headers = DEFAULT_HEADERS;
  }

  static signin(apiKey, email, password) {
    let params = {method: 'POST',
                  uri: BASE_URI + '/sessions',
                  headers: DEFAULT_HEADERS,
                  json: true,
                  form: {apikey: apiKey,
                         email: email,
                         password: password}};
    return new Promise((resolve, reject) => {
      request(params)
        .then((res) => {
          if (res.code) {
            reject(new Error(res));
            return;
          }
          resolve(new ApiClient(res.access_token));
        })
        .catch(reject);
    });
  }

  apiRequest(params) {
    params.uri = BASE_URI + params.path;
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

  postTextMessage(roomUuid, text) {
    return this.apiRequest({
      method: 'POST',
      path: `/rooms/${roomUuid}/messages`,
      form: {
        unique_id: uuid.v4(),
        media: 'text',
        text: text
      }
    });
  }


  createSubscription(roomUuid) {
    return new RoomSubscription(roomUuid, (uuid, lastMessageId) => {
      return this.subscribeMessages(roomUuid, lastMessageId);
    });
  }

  subscribeMessages(roomUuid, newerThan=0) {
    return this.apiRequest({
      method: 'GET',
      path: `/rooms/${roomUuid}/subscribe`,
      qs: {
        newer_than: newerThan
      }
    });
  }

  getRooms() {
    return this.apiRequest({
      method: 'GET',
      path: '/rooms/joined'
    });
  }
}

class RoomSubscription extends EventEmitter {

  constructor(roomUuid, fn) {
    super();
    this.uuid = roomUuid;
    this.fn = fn;
    this.lastMessageId = 0;
    this.deferred = null;
    this.timeout = null;
    this.running = false;
    this.retryInterval = 5000;
  }

  start() {
    if (this.running) {
      return this;
    }
    this.run();
    return this;
  }

  stop() {
    if (!this.running) {
      return;
    }
    if (this.deferred) {
      this.deferred.cancel();
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  run() {
    try { 
      this.emit('request', this.uuid, this.lastMessageId);
      this.deferred = this.fn(this.uuid, this.lastMessageId)
        .then((messages) => {
          if (this.lastMessageId != 0) {
            this.emit('messages', messages);
          };
          messages.forEach((message) => {
            if (message.event == 'message') {
              this.lastMessageId = message.body.id;
            }
          });
          this.retry();
        })
        .catch((e) => {
          if (e.statusCode != 408) {  // timeout
            this.emit('error', e);
          }
          this.retry();
        });
    } catch (e) {
      this.emit('error', e);
      this.retry();
    }
  }

  retry() {
    setTimeout(() => {
      this.run();
    }, this.retryInterval);
  }
}

exports.ApiClient = ApiClient;
