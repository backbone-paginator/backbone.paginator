PROJECT_NAME = $(notdir $(CURDIR))
PROJECT_URL = http://github.com/wyuenho/backbone-pageable
AUTHOR = Jimmy Yuen Ho Wong

JS_FILE = lib/$(PROJECT_NAME).js
JS_OUTFILE = lib/$(PROJECT_NAME).min.js

all: clean test doc build

FORCE:

%.js: FORCE
	echo "/*\n\
	  $(PROJECT_NAME)\n\
	  $(PROJECT_URL)\n\n\
	  Copyright (c) `date +%Y` $(AUTHOR)\n\
	  Licensed under the MIT @license.\n\
	*/" | cat - $@ > "/tmp/`basename $@`" && mv -f "/tmp/`basename $@`" $@

build: FORCE
	uglifyjs $(JS_FILE) --compress --mangle --comments --output $(JS_OUTFILE)

clean: FORCE
	rm -f $(JS_OUTFILE)

doc: FORCE
	jsduck $(JS_FILE) \
		--external=Backbone.Model,Backbone.Collection,XMLHttpRequest \
		--title=backbone-pageable \
		--no-source \
		--categories=categories.json \
		--warnings=-no_doc \
		--pretty-json \
		--output api

test: FORCE
	phantomjs test/runner.js test/index.html?noglobals=true
	phantomjs test/runner.js test/test-zepto.html?noglobals=true
	phantomjs test/runner.js test/index.0.9.10.html?noglobals=true
	phantomjs test/runner.js test/index.0.9.9.html?noglobals=true
