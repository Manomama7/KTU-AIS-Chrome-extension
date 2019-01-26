import * as rp from 'request-promise';
import * as cheerio from 'cheerio';

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
  const options = {
    url: 'https://uais.cr.ktu.lt/shibboleth/SAML2/POST',
    form: {
      SAMLResponse: samlResponse,
      RelayState: relayState,
    },
    simple: false,
  };

  await rp.post(options);

  const opts = {
    url: 'https://uais.cr.ktu.lt/ktuis/studautologin',
  };

  await rp.get(opts);
}

async function login(username, password) {
  const autoLogin = await getAutoLogin();

  if (!autoLogin.authStatus) {
    const loginResponse = await postLogin(username, password, autoLogin);

    if (loginResponse.relayState === undefined
        && loginResponse.samlResponse === undefined) {
      return false;
    }

    const agreeResponse = await getAgree(loginResponse);
    await postContinue(agreeResponse);
  } else {
    await postContinue(autoLogin);
  }

  return true;
}

export default login;
