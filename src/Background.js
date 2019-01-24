import getAuth from './Utils/LoginManager';
import { getModules, getMarkHtmlByModule } from './Utils/MarkScraper';

const alarmName = 'newMarkAlarm';

function Notify(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'logo.png',
    title: 'KTU-AIS Notifier',
    message,
  });
}

function Log(message) {
  console.log(message);
}

async function Authenticate(username, password) {
  Log('Trying to authenticate');

  let response;

  try {
    response = await getAuth(username, password);
  } catch (e) {
    chrome.storage.local.set({
      authStatus: false,
    });

    throw e;
  }

  chrome.storage.local.set({
    authStatus: true,
  });

  return response;
}

async function checkNewMarks() {
  let modules;
  try {
    modules = await getModules();
  } catch (error) {
    Log(error.message);
    try {
      await Authenticate('', '');
      modules = await getModules();
    } catch (err) {
      Log(`Failed to login with error: ${err.message}`);
      Log('Need to login manually through the popup');
      throw new Error('Failed to check for new marks');
    }
  }

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

function startTimedExecution() {
  Log('Starting to monitor for marks');
  Notify('Starting to monitor for marks');

  chrome.alarms.create(alarmName, {
    when: Date.now(),
    periodInMinutes: 1.5,
  });
}

const alarmListener = (alarm) => {
  if (alarm.name === alarmName) {
    Log('Trying to check for new marks');
    checkNewMarks()
      .then((newMarks) => {
        if (newMarks) {
          Log('There are new marks');
          Notify('There are new marks!');
        } else {
          Log('There are no new marks');
        }
        Log('The periodic check of marks was successful');
      })
      .catch((error) => {
        Log(`Failed to get marks with error: ${error}`);
        Log('Clearing alarm');
        Notify('Clearing alarm');
        chrome.alarms.clear(alarmName);
      });
  }
};

chrome.alarms.onAlarm.addListener(alarmListener);

// This is kind of a cheap way to expose the function globally
window.Authenticate = Authenticate;
window.StartTimer = startTimedExecution;

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.get(alarmName, (alarm) => {
    if (alarm === undefined) { startTimedExecution(); }
  });
});
