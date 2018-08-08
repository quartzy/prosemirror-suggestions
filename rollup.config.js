export default {
  input: './src/index.js',
  output: {
    format: 'cjs',
    file: 'dist/index.js',
    sourcemap: true
  },
  plugins: [
    require("rollup-plugin-buble")({objectAssign: "Object.assign"})
  ],
  external(id) {
    return !/^[\.\/]/.test(id)
  },
};
