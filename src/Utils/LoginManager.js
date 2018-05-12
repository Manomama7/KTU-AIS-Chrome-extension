import * as requestPromise from 'request-promise';
import * as cheerio from 'cheerio';

const j = requestPromise.jar();
const rp = requestPromise.defaults({ jar: j });

// TODO: Cleanup the bad code,
//       which is really a hack, but it works

async function getAutoLogin() {
  const options = {
    uri: 'https://uais.cr.ktu.lt/ktuis/studautologin',
  };

  const response = await rp.get(options);
  const $ = cheerio.load(response);

  const authState = $('input[name="AuthState"]').attr('value');

  if (authState === undefined) {
    const authStatus = true;
    const samlResponse = $('input[name="SAMLResponse"]').attr('value');
    const relayState = $('input[name="RelayState"]').attr('value');

    return {
      authStatus,
      samlResponse,
      relayState,
    };
  }

  const authStatus = false;

  return { authStatus, authState };
}

async function postLogin(username, password, { authState }) {
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

  const stateId = $('input[name="StateId"]').attr('value');

  if (stateId === undefined) {
    const authStatus = true;
    const samlResponse = $('input[name="SAMLResponse"]').attr('value');
    const relayState = $('input[name="RelayState"]').attr('value');

    return {
      authStatus,
      samlResponse,
      relayState,
    };
  }

  const authStatus = false;

  return {
    authStatus,
    stateId,
  };
}

async function getAgree({ stateId }) {
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
  const autoLogin = await getAutoLogin();
  let authCookies;

  if (!autoLogin.authStatus) {
    const loginResponse = await postLogin(username, password, autoLogin);

    if (!loginResponse.authStatus) {
      const agreeResponse = await getAgree(loginResponse);
      authCookies = await postContinue(agreeResponse);
    } else if (loginResponse.relayState === undefined &&
        loginResponse.samlResponse === undefined) {
      throw new Error('Problem with login post');
    } else {
      authCookies = await postContinue(loginResponse);
    }
  } else {
    authCookies = await postContinue(autoLogin);
  }

  const login = await getInfo(username, password, authCookies);

  return login;
}

export default getAuthCookies;
