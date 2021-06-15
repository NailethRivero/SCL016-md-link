const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const chalk = require('chalk');

const pathExists = (route) => fs.existsSync(route); // Verifying if path exists

const getAbsolutePath = (route) => (path.isAbsolute(route) ? route : path.resolve(route)); // Converting to absolute

const isFile = (route) => fs.lstatSync(route).isFile(); //// Is it a file?

const readDirectory = (route) => fs.readdirSync(route); // Reading directories

const fileExt = (route) => path.extname(route); //verifying file's extension

//looking  for md files
const getMdFiles = (route) => {
  let arrFiles = [];
  const routeAbsolute = getAbsolutePath(route);
  if (isFile(routeAbsolute)) { 
    if (fileExt(routeAbsolute) === '.md') {
      arrFiles.push(routeAbsolute);
    }
  } else { 
    readDirectory(routeAbsolute).forEach((file) => {
      const newRouteFile = `${routeAbsolute}/${file}`;
      const allFiles = getMdFiles(newRouteFile);
      arrFiles = arrFiles.concat(allFiles);
    });
  }
  return arrFiles; // it returns an arr with the md files route
};

//Getting links from md files
const getLinks = (route) => new Promise((res, rej) => {
  let file = route;

  fs.readFile(file, 'utf-8', (error, data) => {
    const regularExpression = /\[([^\[]+)\](\(.*\))/gm;
    const internalLinks = '#'; // this is to identify internal links

    file = path.resolve(file); 

    if (error) {
      rej(new Error(`${error.code}, Path not found`));
    } else if (data.match(regularExpression)) {
      const arr = data.match(regularExpression);

      const links = arr.map((item) => {
        const divideItem = item.split('](');
        const text = divideItem[0].replace('[', ''); 
        const href = divideItem[1].replace(')', '');
        return ({ href, text, file });
      });

      const getLinksWithUrl = links.filter((link) => !link.href.startsWith(internalLinks));
      res(getLinksWithUrl);
    } else {
      res([]);
    }
  });
});

// getting links from an arr md files
const filesPromises = [];

const getLinksFiles = (arrMdFiles) => {
  arrMdFiles.forEach((file) => filesPromises.push(getLinks(file)));
  return filesPromises;
};


//MD-Links
const mdLinks = (route, { validate }) => {
  if (pathExists(route)) {
    const arrFiles = getMdFiles(route);
    return Promise.all(getLinksFiles(arrFiles))
      .then((arrObjsLinks) => arrObjsLinks.flat()) // this is to delete arr inside an arr
      .then((res) => {
        if (validate) {
          return validateLinks(res);
        }
        return res;
      });
  }
  throw Error('Verifica el path, ruta no encontrada');
};

//Validate Links 
const validateLinks = (arrLinks) => {
  const arrPromises = arrLinks.map((singleLink) => {
    const link = singleLink;

    if (!/^https?:\/\//i.test(link.href)) { // Regex confirms that !https
      link.href = `http://${link.href}`;
    }

    return fetch(link.href)
      .then((res) => {
        if (res.status >= 200 && res.status < 400) {
          return { ...link, status: res.status, statusText: res.statusText };
        }
        return { ...link, status: res.status, statusText: 'Fail' };
      })
      .catch((err) => ({ ...link, status: `Error (${err.errno})`, statusText: `Error code (${err.code})` }));
  });
  return Promise.all(arrPromises);
};

const pathPrueba = './TEST.md';

//links
mdLinks(pathPrueba, { validate: false })
  .then(console.log)
  .catch(console.error);

// validate
mdLinks(pathPrueba, { validate: true })
  .then(console.log)
  .catch(console.error);

//stats
mdLinks(pathPrueba, { validate: false })
  .then((resp) => {
    const statsLinks = getStats(resp);
    console.log(chalk.hex('8BDCD6').underline('Stats'));
    console.log(`Total: ${statsLinks.Total}. Unique: ${statsLinks.Unique}.`);
    console.table(statsLinks);
  })
  .catch(console.error);

// Stats + validate
mdLinks(pathPrueba, { validate: true })
  .then((resp) => {
    const statsLinksValidate = getStatsValidate(resp);
    console.log(chalk.hex('8BDCD6').italic('Stats + Validate'));
 
    console.table(statsLinksValidate);
  })
  .catch(console.error);

//Stats Links (Unique + Total)
const getStats = (arrLinks) => {
  const totalLinks = arrLinks.length;
  const linksUniqueArray = [...new Set(arrLinks.map((link) => link.href))];

  return { Total: totalLinks, Unique: linksUniqueArray.length };
};

//Stats + Validate Links (Unique + Total + broken)

const getStatsValidate = (arrLinksValidate) => {
  const totalLinks = arrLinksValidate.length;
  const linksUniqueArray = [...new Set(arrLinksValidate.map((link) => link.href))];
  const failedLinks = arrLinksValidate.filter((link) => link.statusText !== 'OK');

  return { Total: totalLinks, Unique: linksUniqueArray.length, Broken: failedLinks.length };
};
  module.exports = {
    getStats,
    getStatsValidate,
    mdLinks,
  };