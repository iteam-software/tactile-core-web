
const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const beautify = require('json-beautify');
const pkg = require('../package.json');

webpack(require('../webpack.config'))
  .run((err, stats) => {
    if (err) {
      console.error(stats.toString());
    } else {
      console.log('Build complete!');

      delete pkg.devDependencies;
      delete pkg.scripts;

      fs.writeFile(
        path.resolve(__dirname, '../dist/package.json'),
        beautify(pkg, null, 2),
        () => {}
      );

      fs.createReadStream('./README.md')
        .pipe(fs.createWriteStream('./dist/README.md'));

      fs.createReadStream('./LICENSE')
        .pipe(fs.createWriteStream('./dist/LICENSE'));
    }
  });
