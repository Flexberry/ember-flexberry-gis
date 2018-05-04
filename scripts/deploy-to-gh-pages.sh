#!/bin/bash

# Exit with nonzero exit code if anything fails.
set -e

# Define repository relative GitHub address.
repositoryRelativeGitHubAddress="Flexberry/ember-flexberry-gis"

# Clone project into 'repository' subfolder && move to it.
echo "Prepare for deploy to gh-pages."
echo "Clone ${repositoryRelativeGitHubAddress} repository & checkout latest version of gh-pages branch."
git clone --depth=50 --branch=gh-pages "https://github.com/${repositoryRelativeGitHubAddress}.git" repository
cd repository

# Remove results of previous deploy (for current branch) & recreate directory.
echo "Remove results of previous deploy (for ${TRAVIS_BRANCH} branch)."
rm -rf "${TRAVIS_BRANCH}"
mkdir "${TRAVIS_BRANCH}"

# Copy builded ember application from 'dist' folder into 'repository/${TRAVIS_BRANCH}'.
echo "Copy builded ember application (for ${TRAVIS_BRANCH} branch)."
cp -r ../dist/* "${TRAVIS_BRANCH}"

# Autodocumentation for 'master' and 'develop' branches.
if [ ${TRAVIS_BRANCH} == "master" ] || [ ${TRAVIS_BRANCH} == "develop" ]
then
  cd ..

  # Install yuidoc.
  npm install -g yuidocjs

  # Clone the repository with the yuidoc template into docs directory and move to it.
  git clone --recursive --branch=${TRAVIS_BRANCH} "https://github.com/Flexberry/flexberry-yuidoc-theme.git" docs
  cd docs

  # Copy addon source into addon directory.
  mkdir addon
  cp -r ../addon/* addon

  # Generate autodocumentation.
  yuidoc

  # Clean results of previous build and copy new.
  rm -rf "../repository/autodoc/${TRAVIS_BRANCH}"
  mkdir -p "../repository/autodoc/${TRAVIS_BRANCH}"
  cp -r autodoc-result/* "../repository/autodoc/${TRAVIS_BRANCH}"

  cd ../repository
fi

# Configure git.
git config user.name "Flexberry-man"
git config user.email "mail@flexberry.net"

echo "Commit & push changes."
git add --all
git commit -m "Update gh-pages for ${TRAVIS_BRANCH} branch"

# Redirect any output to /dev/null to hide any sensitive credential data that might otherwise be exposed.
git push --force --quiet "https://${GH_TOKEN}@github.com/${repositoryRelativeGitHubAddress}.git" > /dev/null 2>&1

echo "Deploy to gh-pages finished."
