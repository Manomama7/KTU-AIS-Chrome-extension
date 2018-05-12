let rp = require('request-promise');
const cheerio = require('cheerio');

const j = rp.jar();
rp = rp.defaults({ jar: j });

// This is for the real one
// import * as requestPromise from 'request-promise';
// const j = requestPromise.jar();
// const rp = requestPromise.defaults({ jar: j });

// Must not use jsdom - doesnt compile

async function getAutoLogin() {
  const options = {
    uri: 'https://uais.cr.ktu.lt/ktuis/studautologin',
  };

  const response = await rp.get(options);
  console.log(response);
  const $ = cheerio.load(response);

  const select = $('input[name="AuthState"]').attr('value');

  return select;
}

async function postLogin(username, password, authState) {
  let uri = 'https://login.ktu.lt/simplesaml/module.php/core/loginuserpass.php?';
  uri += `username=${username}&`;
  uri += `password=${password}&`;
  uri += `AuthState=${authState}`;

  const options = {
    method: 'POST',
    uri,
  };

  const response = await rp.get(options);

  const $ = cheerio.load(response);

  const select = $('input[name="StateId"]').attr('value');

  return select;
}

async function getAgree(stateId) {
  const options = {
    uri: `https://login.ktu.lt/simplesaml/module.php/consent/getconsent.php?StateId=${stateId}&yes=Yes%2C%20continue%0D%0A&saveconsent=1`,
  };

  const response = await rp.get(options);

  const $ = cheerio.load(response);

  const samlResponse = $('input[name="SAMLResponse"]').attr('value');

  const relayState = $('input[name="RelayState"]').attr('value');

  return { samlResponse, relayState };
}

async function postContinue({ samlResponse, relayState }) {
  const cjar = rp.jar();

  const options = {
    url: 'https://uais.cr.ktu.lt/shibboleth/SAML2/POST',
    form: {
      SAMLResponse: samlResponse,
      RelayState: relayState,
    },
    simple: false,
    jar: cjar,
  };

  await rp.post(options);

  const opts = {
    url: 'https://uais.cr.ktu.lt/ktuis/studautologin',
    jar: cjar,
  };

  await rp.get(opts);

  return cjar;
}

async function getInfo(username, password, cjar) {
  const options = {
    uri: 'https://uais.cr.ktu.lt/ktuis/vs.ind_planas',
    jar: cjar,
  };

  const response = await rp.get(options);
  console.log(response);
  const $ = cheerio.load(response);

  const name = $('#ais_lang_link_lt').parent().text().split(' ');

  return {
    name,
    username,
    password,
    cookies: cjar,
  };
}

async function getAuthCookies(username, password) {
  const authState = await getAutoLogin();
  const stateId = await postLogin(username, password, authState);
  const agreeResponse = await getAgree(stateId);
  const authCookies = await postContinue(agreeResponse);
  const login = await getInfo(username, password, authCookies);

  return login;
}

getAuthCookies('marsta11', '***REMOVED***')
  .then((response) => {
    console.log('Login success!');
    console.log(response);
  })
  .catch((error) => {
    console.log('Login failed!');
    console.log(error);
  });
