#!/bin/sh

rm -d ./lib
mkdir "lib"
cp ./src/backbone.paginator.js ./lib/

./node_modules/.bin/babel lib/backbone.paginator.js \
  --out-file=lib/backbone.paginator.min.js \
  --no-comments \
  --compact=true \
  --presets=minify \
  --minified \
  --source-type=script
