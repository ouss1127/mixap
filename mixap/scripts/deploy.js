/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const Application = require('ssh-deploy-release');

const options = {
  localPath: 'build',
  host: 'mixap.univ-lemans.fr',
  username: 'mixap',
  password: "C'est bon pour les bébés!",
  deployPath: '/usr/share/nginx/html',
};

const deployer = new Application(options);

deployer.deployRelease(() => {
  console.log('Ok !');
});

/*
cd /usr/share/nginx/html
rm -rf static
mv www/* .
*/
