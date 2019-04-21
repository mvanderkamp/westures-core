
.PHONY: release lint fix bundle tags docs min

lint:
	npx eslint src;

release: lint bundle min docs tags

fix:
	npx eslint src --fix;

bundle:
	npx browserify 'index.js' \
		--standalone westures-core \
		--outfile 'dist/bundle.js';

docs:
	npx jsdoc -c .jsdocrc.json;

redoc:
	mv docs/styles/custom.css .;
	rm -rf docs;
	mkdir -p docs/styles;
	mv custom.css docs/styles/;
	npx jsdoc -c .jsdocrc.json;

tags:
	ctags -R src;

min:
	npx terser 'dist/bundle.js' \
		--compress \
		--mangle \
		--output 'dist/bundle.min.js';

