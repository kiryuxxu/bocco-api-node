const bocco = require('../lib/bocco');


const API_KEY = 'API KEY';
const EMAIL = 'test@example.com'
const PASSWORD = 'password';


bocco.ApiClient.signin(API_KEY, EMAIL, PASSWORD)
  .then((api) => {
    console.log(api.accessToken);
  })
  .catch((e) => {
    console.log(e);
  });
