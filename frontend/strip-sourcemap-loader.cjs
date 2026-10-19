/**
 * Webpack loader that strips `//# sourceMappingURL=` comments from JS files.
 * Used to suppress browser 404 errors for missing source maps in framer-motion.
 */
module.exports = function stripSourceMapLoader(source) {
  return source.replace(/\/\/# sourceMappingURL=\S+\.map\s*$/gm, '');
};
