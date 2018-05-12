import * as requestPromise from 'request-promise';
import * as cheerio from 'cheerio';

const j = requestPromise.jar();
const rp = requestPromise.defaults({ jar: j });

// TODO: Bypass CORS

async function getAutoLogin() {
  const options = {
    uri: 'https://uais.cr.ktu.lt/ktuis/studautologin',
    headers: {
      RequestMode: 'no-cors',
    },
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

  return {
    samlResponse,
    relayState,
  };
}

async function postContinue({
  samlResponse,
  relayState,
}) {
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

export default getAuthCookies;
