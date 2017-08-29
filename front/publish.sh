#!/usr/bin/env sh
npm run-script build
rsync -av ./index.html $1@ebets.ch:/var/www/ebets.ch/html/ 
rsync -av ./dist $1@ebets.ch:/var/www/ebets.ch/html/ 
