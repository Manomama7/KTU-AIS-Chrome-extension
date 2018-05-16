import getAuth from './Utils/LoginManager';

function Notify(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'logo.png',
    title: 'Don\'t forget!',
    message,
  });
}

async function Authenticate(username, password) { // eslint-disable-line
  chrome.alarms.create('Hello world alarm', {
    when: Date.now(),
    periodInMinutes: 1,
  });

  Notify('Trying to authenticate');

  const response = await getAuth(username, password);
  return response;
}


chrome.alarms.onAlarm.addListener(() => {
  console.log('Trying to auth');
});

// This is kind of a cheap way to expose the function globally
window.Authenticate = Authenticate;
