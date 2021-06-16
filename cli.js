const program = require('commander');
const chalk = require('chalk');
const mdLinks  = require('./index.js');

program
  .version('0.0.1')
  .option('-v, --validate', 'Return validate links')
  .option('-s, --stats', 'Return links stats');

program.parse(process.argv);
const path = process.argv[2];

//Stats Links (Unique & Total)
const getStats = (arrLinks) => {
	const totalLinks = arrLinks.length;
	const linksUniqueArray = [...new Set(arrLinks.map((link) => link.href))];
  
	return { Total: totalLinks, Unique: linksUniqueArray.length };
  };
  
//Stats + Validate Links (Unique & Total & broken)
  
  const getStatsValidate = (arrLinksValidate) => {
	const totalLinks = arrLinksValidate.length;
	const linksUniqueArray = [...new Set(arrLinksValidate.map((link) => link.href))];
	const failedLinks = arrLinksValidate.filter((link) => link.statusText !== 'OK');
  
	return { Total: totalLinks, Unique: linksUniqueArray.length, Broken: failedLinks.length };
  };

//validate
if (program.validate && !program.stats) {
	mdLinks(path, { validate: true })
	  .then(console.log)
	  .catch(console.error);
  }

//Stats
 else if (!program.validate && program.stats) {
	mdLinks(path, { validate: false })
	  .then((resp) => {
		const statsLinks = getStats(resp);
		console.table(statsLinks);
	  })
	  .catch(console.error);
  }

//validate & stats
else if (program.validate && program.stats) {
  mdLinks(path, { validate: true })
    .then((resp) => {
      const statsLinksValidate = getStatsValidate(resp);
      console.table(statsLinksValidate);
    })
    .catch(console.error);
};


 
  const testingPath = './TEST.md';

  //links
  mdLinks(testingPath, { validate: false })
	.then(console.log)
	.catch(console.error);
  
  // validate
  mdLinks(testingPath, { validate: true })
	.then(console.log)
	.catch(console.error);
  
  //stats
  mdLinks(testingPath, { validate: false })
	.then((resp) => {
	  const statsLinks = getStats(resp);
	  console.log(chalk.hex('8BDCD6').underline('Stats'));
	  console.log(`Total: ${statsLinks.Total}. Unique: ${statsLinks.Unique}.`);
	  console.table(statsLinks);
	})
	.catch(console.error);
  
  // Stats + validate
  mdLinks(testingPath, { validate: true })
	.then((resp) => {
	  const statsLinksValidate = getStatsValidate(resp);
	  console.log(chalk.hex('8BDCD6').italic('Stats + Validate'));
   
	  console.table(statsLinksValidate);
	})
	.catch(console.error);