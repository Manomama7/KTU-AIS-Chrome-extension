import * as rp from 'request-promise';

import { getModules, getMarkHtmlByModule, isLoginPage } from './MarkScraper';
import KtuLogin from './LoginManager';

const ALARM_NAME = 'newMarkAlarm';

function Notify(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'logo.png',
    title: 'KTU-AIS Notifier',
    message,
  });
}


async function checkNewMarks() {
  const modules = await getModules();

  const modulePromises = modules.map(module => getMarkHtmlByModule(module));

  let marks = await Promise.all(modulePromises);

  // These two lines act as a sort of hash for easy equality comparison
  marks.sort();
  marks = JSON.stringify(marks);

  const getFromStorage = what => new Promise(resolve => chrome.storage.local.get(what, resolve));

  const oldMarks = await getFromStorage(['marks']);

  const newMarks = oldMarks.marks !== marks;

  chrome.storage.local.set({
    marks,
  });

  return newMarks;
}

function startTimer() {
  Notify('Starting to monitor for marks');

  chrome.alarms.create(ALARM_NAME, {
    when: Date.now(),
    periodInMinutes: 1.5,
  });
}

export async function isLoggedIn() {
  const response = await rp.get('https://uais.cr.ktu.lt/ktuis/stud.busenos');

  return !isLoginPage(response);
}

export const startupAction = () => {
  chrome.alarms.get(ALARM_NAME, (alarm) => {
    if (alarm === undefined) {
      isLoggedIn()
        .then((loggedIn) => {
          if (loggedIn) {
            startTimer();
          } else {
            Notify('You need to login to KTU AIS to receive mark notifications');
          }
        });
    }
  });
};

export const timedAction = (alarm) => {
  if (alarm.name === ALARM_NAME) {
    isLoggedIn()
      .then((loggedIn) => {
        if (!loggedIn) {
          Notify('You need to login to KTU AIS to continue checking for marks');
          chrome.alarms.clear(ALARM_NAME);
        } else {
          checkNewMarks()
            .then((newMarks) => {
              if (newMarks) {
                Notify('There are new marks!');
              } else {
                console.log('There are no new marks');
              }
            });
        }
      });
  }
};


export async function loginAndStartTimer(username, password) {
  const loginStatus = await KtuLogin(username, password);

  if (!loginStatus) {
    return false;
  }

  startTimer();
  return true;
}
