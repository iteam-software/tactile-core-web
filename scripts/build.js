
const webpack = require('webpack');

webpack(require('../webpack.config'))
  .run((err, stats) => {
    if (err) {
      console.error(stats.toString());
    } else {
      console.log('Build complete!');
    }
  });
