
const webpack = require('webpack');
const fs = require('fs');
const beautify = require('json-beautify');
const pkg = require('../package.json');
const args = require('args');
const semver = require('semver');
const git = require('simple-git');
const cmd = require('node-cmd');

args
  .option(
    'level',
    'The release level [major | minor | patch]. ' +
      'This will increment the version like: major.minor.patch',
    undefined,
    (level) => {
      if (['patch', 'minor', 'major'].indexOf(level) === -1) {
        throw new Error('Invalid level provided. Please use patch|minor|major');
      }
    });

const flags = args.parse(process.argv);
const level = flags.level;

if (level) {
  webpack(require('../webpack.config'))
    .run((err, stats) => {
      if (err) {
        console.error(stats.toString());
      } else {
        console.log('Build complete!');

        const versionBackup = pkg.version;
        const devDepsBackup = pkg.devDependencies;
        const scriptsBackup = pkg.scripts;
        const jestBackup = pkg.jest;

        pkg.version = semver.inc(pkg.version, level);
        fs.writeFile('./package.json', beautify(pkg, null, 2), () => {});

        console.log('- Running npm publish');

        const npmPublish = cmd.run('npm publish');
        npmPublish.stderr.on('data', (data) => console.error(data));
        npmPublish.stdout.on('data', (data) => console.log(data));
        npmPublish.on('close', (code) => {
          if (code === 0) {
            console.log('- Creating publish commit');
            git()
              .add('./*')
              .commit(`chore: release v${pkg.version}`)
              .addTag(`v${pkg.version}`)
              .push('origin', 'master')
              .pushTags('origin');

            console.log('Publish complete!');
          } else {
            console.log('- Reverting package.json');
            pkg.devDependencies = devDepsBackup;
            pkg.scripts = scriptsBackup;
            pkg.version = versionBackup;
            pkg.jest = jestBackup;

            fs.writeFile('./package.json', beautify(pkg, null, 2), () => {});
          }
        });
      }
    });
} else {
  console.log(
    'Please specify a publish level. Use npm run publish -- --help ' +
    'for more information.');
}
