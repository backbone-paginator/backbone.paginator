#!/bin/sh

rm -d ./lib
mkdir "lib"

./node_modules/.bin/babel src/backbone.paginator.js \
  --out-file=lib/backbone.paginator.js \
  --source-type=module

./node_modules/.bin/babel lib/backbone.paginator.js \
  --out-file=lib/backbone.paginator.min.js \
  --no-comments \
  --compact=true \
  --presets=minify \
  --minified \
  --source-type=script
