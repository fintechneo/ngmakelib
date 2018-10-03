import { uglify } from 'rollup-plugin-uglify';

export default {
    input: 'build/ngmakelib.api.js',
    output: {
      file: 'bin/ngmakelib.api.js', // output a single application bundle
      format: 'cjs'
    },    
    sourceMap: false,
    plugins: [
      uglify()
    ]
}  