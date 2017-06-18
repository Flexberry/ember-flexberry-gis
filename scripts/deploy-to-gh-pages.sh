#!/bin/bash

# Exit with nonzero exit code if anything fails.
set -e

# Define repository relative GitHub address.
repositoryRelativeGitHubAddress="Flexberry/ember-flexberry-gis"

# Clone project into 'repository' subfolder && move to it.
echo "Prepare for deploy to gh-pages."
echo "Clone ${repositoryRelativeGitHubAddress} repository & checkout latest version of gh-pages branch."
git clone --recursive "https://github.com/${repositoryRelativeGitHubAddress}.git" repository
cd repository

# Remember existing remote branches in array.
existingRemoteBranches=()
for branch in `git branch -r`;
do
  branch="${branch#origin/}"

  branchAlreadyAdded=false
  if [ $(echo ${existingRemoteBranches[@]} | grep -o "${branch}" | wc -w) -ne 0 ];
  then
    branchAlreadyAdded=true
  fi

  if [ $branchAlreadyAdded = false ] && [ "${branch}" != "HEAD" ] && [ "${branch}" != "->" ];
  then
    existingRemoteBranches=("${existingRemoteBranches[@]}" "${branch}")
  fi
done

# Checkout gh-pages brunch & pull it's latest version.
git checkout gh-pages
git pull

# Itarate over 'gh-pages'-branch directories (except 'stylesheets' and 'images').
shopt -s dotglob
find * -prune -type d | while read directory; do
  if [ "${directory}" != "stylesheets" ] && [ "${directory}" != "images" ] && [ "${directory}" != ".git" ];
  then
    branch="${directory}"

    branchExists=false
    if [ $(echo ${existingRemoteBranches[@]} | grep -o "${branch}" | wc -w) -ne 0 ];
    then
      branchExists=true
    fi

    # Remove directories for those branches which doesn't exist anymore.
    if [ $branchExists = false ];
    then
      echo "Remove results of previous deploy (for ${branch} branch), because it doesn't exist anymore."
      rm -rf "${branch}"
    fi
  fi
done

# Remove results of previous deploy (for current branch) & recreate directory.
echo "Remove results of previous deploy (for ${TRAVIS_BRANCH} branch)."
rm -rf "${TRAVIS_BRANCH}"
mkdir "${TRAVIS_BRANCH}"

# Copy builded ember application from 'dist' folder into 'repository/${TRAVIS_BRANCH}'.
echo "Copy builded ember application (for ${TRAVIS_BRANCH} branch)."
cp -r ../dist/* "${TRAVIS_BRANCH}"

# Remove previously created index.html page and recreate it with links to application versions related to all existing remote brunches.
rm -rf index.html
cp index.hbs index.html
for branch in "${existingRemoteBranches[@]}"
do
  branchDescription=""
  if [ "${branch}" = "master" ];
  then
    branchDescription="Stable version"
  fi

  if [ "${branch}" = "develop" ];
  then
    branchDescription="Bleeding edge version"
  fi

  if [ "${branch}" = "test" ];
  then
    branchDescription="Temporal testing version"
  fi

  branchLink="<a href=\"${branch}\/index.html\">http:\/\/flexberry.github.io\/ember-flexberry-gis\/${branch}\/<\/a>"
  branchTableRow="<tr>\n<td>${branch}<\/td>\n<td>${branchDescription}<\/td>\n<td>${branchLink}<\/td>\n<\/tr>\n{{branches}}"
  sed -i -e "s/{{branches}}/${branchTableRow}/g" index.html
done
sed -i -e "s/{{branches}}//g" index.html

# Configure git.
git config user.name "Flexberry-man"
git config user.email "mail@flexberry.net"

echo "Commit & push changes."
git add --all
git commit -m "Update gh-pages for ${TRAVIS_BRANCH} branch"

# Redirect any output to /dev/null to hide any sensitive credential data that might otherwise be exposed.
git push --force --quiet "https://${GH_TOKEN}@github.com/${repositoryRelativeGitHubAddress}.git" > /dev/null 2>&1

echo "Deploy to gh-pages finished."
