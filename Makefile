
.PHONY: release lint fix parcel tags docs coverage

lint:
	npx eslint src;
	npx eslint test \
	--global jest,expect,test,describe,beforeEach,beforeAll \
	--rule 'init-declarations: off';
	npx eslint index.js;

release: lint parcel docs tags coverage

fix:
	npx eslint src --fix;
	npx eslint test \
	--global jest,expect,test,describe,beforeEach,beforeAll \
	--rule 'init-declarations: off' \
	--fix;
	npx eslint index.js --fix;

parcel:
	npx parcel build 'index.js';

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

coverage:
	npx jest --coverage && cat ./coverage/lcov.info | npx coveralls

