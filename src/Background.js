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

async function Authenticate(username, password) {
  console.log('Trying to authenticate');

  const response = await getAuth(username, password);
  return response;
}

async function checkNewMarks() {
  let modules;
  try {
    modules = await getModules();
  } catch (error) {
    console.log(error.message);
    try {
      await Authenticate('', '');
      modules = await getModules();
    } catch (err) {
      console.log(`Failed to login with error: ${err.message}`);
      console.log('Need to login manually through the popup');
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
  console.log('Starting to monitor for marks');
  Notify('Starting to monitor for marks');

  chrome.alarms.create(alarmName, {
    when: Date.now(),
    periodInMinutes: 1.5,
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === alarmName) {
    console.log('Trying to check for new marks');
    checkNewMarks()
      .then((newMarks) => {
        if (newMarks) {
          console.log('There are new marks');
          Notify('There are new marks!');
        } else {
          console.log('There are no new marks');
        }
        console.log('The periodic check of marks was successful');
      })
      .catch((error) => {
        console.log(`Failed to get marks with error: ${error}`);
        console.log('Clearing alarm');
        Notify('Clearing alarm');
        chrome.alarms.clear(alarmName);
      });
  }
});

// This is kind of a cheap way to expose the function globally
window.Authenticate = Authenticate;
window.StartTimer = startTimedExecution;

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.get(alarmName, (alarm) => {
    if (alarm === undefined) { startTimedExecution(); }
  });
});
