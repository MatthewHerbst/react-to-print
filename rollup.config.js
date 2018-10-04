import babel from 'rollup-plugin-babel';
import replace from "rollup-plugin-replace";
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';

export default {
  input: 'src/index.js',
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    commonjs({
      include: [
        'node_modules/**'
      ]
    }),
    babel({
      "presets": [
        "react",
        ["env", {
          "targets": {
            "browsers": ["> 1%", "iOS >= 8", "Android >= 4", "ie >= 10"]
          },
          "debug": false,
          "modules": false
        }]
      ],
      "plugins": [
        "external-helpers",
        "transform-object-rest-spread",
        "babel-plugin-transform-class-properties",
        "transform-react-remove-prop-types"
      ],
      babelrc: false
    }),
    uglify({
      compress: {
        warnings: false,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
      },
      output: {
        comments: false,
      }
    })
  ],
  output: {
    file: 'lib/index.js',
    format: 'cjs'
  },
  sourcemap: true
};
