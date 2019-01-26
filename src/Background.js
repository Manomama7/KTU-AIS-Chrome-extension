import { timedAction, startupAction } from './Utils/KtuApi';

chrome.alarms.onAlarm.addListener(timedAction);
chrome.runtime.onStartup.addListener(startupAction);
