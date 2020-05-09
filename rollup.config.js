import babel from '@rollup/plugin-babel';
import {terser} from 'rollup-plugin-terser';

import pkg from './package.json';

const output = {
    name: 'Backbone.PageableCollection',
    globals: {
        'underscore': '_',
        'backbone': 'Backbone'
    },
    file: pkg.main,
    format: 'umd',
    noConflict: true
};

export default {
    input: 'src/backbone.paginator.js',
    output: [
        output,
        {
            ...output,
            sourcemap: true,
            file: output.file.replace(/\.js$/, '.min.js'),
            plugins: [
                terser({
                    output: {
                        comments: false
                    }
                })
            ]
        }
    ],
    external: [
        'underscore',
        'backbone',
        '@babel/runtime'
    ],
    plugins: [
        babel({
            babelHelpers: 'runtime',
            exclude: [
                'node_modules/**'
            ]
        })
    ]
};
