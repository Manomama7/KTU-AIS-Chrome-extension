import * as rp from 'request-promise';
import * as cheerio from 'cheerio';

export function isLoginPage(response) {
  const $ = cheerio.load(response);

  const input = $('input[value="Prisijungimas"]').length;

  return !(input === 0 && response.length > 50);
}

export async function getModules() {
  const response = await rp.get('https://uais.cr.ktu.lt/ktuis/stud.busenos');

  const loginPage = isLoginPage(response);

  if (loginPage) {
    throw new Error('Student not logged in');
  }

  const $ = cheerio.load(response);

  const moduleTableRows = $('.info-fixed-h1').first().find('div > table > tbody > tr');

  const modules = [];

  moduleTableRows.each((i, elem) => {
    const spanHtml = $(elem).children().last().html();
    const regex = /\((.+),(.+)\)/;
    const match = spanHtml.match(regex);
    const p1 = match[1];
    const p2 = match[2].replace(/&apos;/g, '');
    modules[i] = {
      p1,
      p2,
    };
  });

  return modules;
}

export async function getMarkHtmlByModule(module) {
  const uri = `https://uais.cr.ktu.lt/ktuis/STUD_SS2.infivert?p1=${module.p1}&p2=${module.p2}`;

  const response = await rp.post(uri);
  const $ = cheerio.load(response);

  const select = $('.dtr').first().html();

  return select;
}
