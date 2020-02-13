for f in *.gs; do mv -- "$f" "${f%.gs}.js"; done
jsdoc2md --files util.js config.js > docs/UTILS.md
jsdoc2md --files handleGet.js handlePost.js > docs/API.md
jsdoc2md --files Code.js build.js > docs/FUNCTIONS.md
for f in *.js; do mv -- "$f" "${f%.js}.gs"; done