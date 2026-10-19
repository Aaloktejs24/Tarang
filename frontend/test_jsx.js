const babel = require('@babel/core');
const code = '<div title="Father&apos;s Name" />';
const output = babel.transformSync(code, { presets: ['@babel/preset-react'] });
console.log(output.code);
