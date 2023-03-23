const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs').promises;

const dataFolder = `${__dirname}/tmp_data`;

module.exports = async function (githubUrl) {
  const downloadGithubRepo = async url => {
    let folderName = (Math.random() + 1).toString(36).substring(7);
    const { stdout, stderr } = await exec(`cd ${dataFolder} && git clone ${url} ${folderName}`);

    return folderName;
  };

  const extractFileNames = async (folder, partialFileName) => {
    const { stdout, stderr } = await exec(
      `find ${dataFolder}/${folder} -type f -name "*.${partialFileName}"`,
    );

    const fnameRegex = new RegExp(/[ \w-]+?(?=\.)/);
    const fNames = stdout.split('\n');

    return {
      fnames: fNames.map(fname => {
        fname = fname.replace('andrii.studinskyi', 'haha'); //hack
        const shortName = fname.match(fnameRegex);
        if (shortName && shortName[0]) return shortName[0];
        return null;
      }),
      fnamesWithPath: fNames,
    };
  };

  const camelToSnakeCase = str => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

  function extractDTOs(code) {
    const regex = new RegExp(/\w+Dto\b/);
    let dtos = code.match(regex);
    console.log(dtos);
    if (dtos && dtos.length) {
      dtos = dtos.map(dtoName => {
        return camelToSnakeCase(dtoName).slice(1) + '.ts';
      });
    }

    return dtos;
  }

  const folder = await downloadGithubRepo(githubUrl);
  const controllers = await extractFileNames(folder, 'controller.ts');
  // const services = await extractFileNames(folder, 'service.ts');
  // const dtos = await extractFileNames(folder, 'dto.ts');
  // const middlewares = await extractFileNames(folder, 'middleware.ts');
  const filePromises = controllers.fnamesWithPath
    .filter(path => path !== '')
    .map(path => fs.readFile(path));
  const buffers = await Promise.all(filePromises);
  return buffers.map(b => b.toString());
};

// fs.readFile(
//   '/Users/andrii.studinskyi/Projects/tmp_data/a6klr/src/article/article.service.ts',
//   'utf8',
//   (err, data) => {
//     if (err) {
//       console.error(err);
//       return;
//     }
//     console.log(extractDTOs(data));
//   },
// );
