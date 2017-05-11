#!/bin/bash

# Exit with nonzero exit code if anything fails.
set -e

# Clone project into 'repository' subfolder && move to it.
echo "Prepare for deploy to gh-pages."
echo "Clone ember-flexberry-gis-yandex repository & checkout latest version of gh-pages branch."
git clone --recursive https://github.com/Flexberry/ember-flexberry-gis-yandex.git repository
cd repository

# Checkout gh-pages brunch & pull it's latest version.
git checkout gh-pages
git pull

# Remove results of previous deploy (for current branch) & recreate directory.
echo "Remove results of previous deploy (for ${TRAVIS_BRANCH} branch)."
rm -rf "${TRAVIS_BRANCH}"
mkdir "${TRAVIS_BRANCH}"

# Copy builded ember application from 'dist' folder into 'repository/${TRAVIS_BRANCH}'.
echo "Copy builded ember application (for ${TRAVIS_BRANCH} branch)."
cp -r ../dist/* "${TRAVIS_BRANCH}"

# Configure git.
git config user.name "Flexberry-man"
git config user.email "mail@flexberry.net"

echo "Commit & push changes."
git add --all
git commit -m "Update gh-pages for ${TRAVIS_BRANCH} branch"

# Redirect any output to /dev/null to hide any sensitive credential data that might otherwise be exposed.
git push --force --quiet "https://${GH_TOKEN}@github.com/Flexberry/ember-flexberry-gis-yandex.git" > /dev/null 2>&1

echo "Deploy to gh-pages finished."
