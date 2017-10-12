import shebang from 'rollup-plugin-shebang';

export default {
    input: 'build/ngmakelib.js',
    output: {
      file: 'bin/ngmakelib.js', // output a single application bundle
      format: 'iife'
    },    
    sourceMap: false,
    plugins: [
      shebang()
    ]
}  