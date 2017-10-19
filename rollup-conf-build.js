import shebang from 'rollup-plugin-shebang';
import uglify from 'rollup-plugin-uglify';

export default {
    input: 'build/ngmakelib.js',
    output: {
      file: 'bin/ngmakelib.js', // output a single application bundle
      format: 'cjs'
    },    
    sourceMap: false,
    plugins: [
      uglify(),
      shebang()
    ]
}  