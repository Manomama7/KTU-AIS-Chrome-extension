import * as rp from 'request-promise';

import { getModules, getMarkHtmlByModule, isLoginPage } from './MarkScraper';

const ALARM_NAME = 'newMarkAlarm';
const MARK_CHECKING_PERIOD = 1.5; // In minutes

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
  Notify('Starting the mark monitor timer');

  chrome.alarms.create(ALARM_NAME, {
    when: Date.now(),
    periodInMinutes: MARK_CHECKING_PERIOD,
  });
}

export async function isLoggedIn() {
  const response = await rp.get('https://uais.cr.ktu.lt/ktuis/stud.busenos');

  return !isLoginPage(response);
}

const getAlarm = alarmName => new Promise(resolve => chrome.alarms.get(alarmName, resolve));

export const startupAction = () => {
  getAlarm(ALARM_NAME)
    .then((alarm) => {
      if (alarm === undefined) {
        startTimer();
      }
    });
};

export const timedAction = (alarm) => {
  if (alarm.name === ALARM_NAME) {
    isLoggedIn()
      .then((loggedIn) => {
        if (!loggedIn) {
          Notify('You need to login to KTU AIS to continue checking for marks');
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
