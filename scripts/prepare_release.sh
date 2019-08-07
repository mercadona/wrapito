#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
BOLD='\033[1m'
NC='\033[0m' # No Color
REPOSITORY=$(basename `git rev-parse --show-toplevel`)
VERSION_LABEL=$1
BRANCH=$(git rev-parse --abbrev-ref HEAD)
MY_DIR="$(dirname "$0")"

if [ "$VERSION_LABEL" != "--major" ] && [ "$VERSION_LABEL" != "--minor" ] && [ "$VERSION_LABEL" != "--patch" ]; then
  printf "$RED WARNING - argument must be '--major', '--minor' or '--patch''$NC \n"
  printf "Usage: update_version [--major | --minor | --patch]\n"
  printf "\n"
  printf "Semantic Versioning 2.0.0\n"
  printf "\n"
  printf "Given a version number MAJOR.MINOR.PATCH, increment the:\n"
  printf "\n"
  printf "MAJOR version when you make incompatible API changes,\n"
  printf "MINOR version when you add functionality in a backwards-compatible manner, and\n"
  printf "PATCH version when you make backwards-compatible bug fixes.\n"
  printf "Additional labels for pre-release and build metadata are available as extensions to\n"
  printf "the MAJOR.MINOR.PATCH format.\n"
  printf "\n"
  exit 1;
fi

if [[ "$BRANCH" != "master" ]]; then
    echo -e "$RED You are not on master. Aborting. $NC"
    exit 1;
fi

git fetch
COMMITS_BEHIND=$(git rev-list --count master..origin/master)

if [[ "$COMMITS_BEHIND" -gt "0" ]]; then
    echo -e "$RED WARNING: You are attempting to deploy while your local master branch \
is $COMMITS_BEHIND commits behind origin/master $NC"
    read -r -p "Would you like to pull the latest changes [y|n]?" response
    if [[ $response =~ ^(yes|Y|y) ]]; then
        git pull
    else
        exit 1;
    fi
fi

if git tag -d $(git tag) &>/dev/null; then
    echo "Deleting tags..."
    sleep 1
else
    echo "$RED ERROR deleting tags $NC"
    exit 1;
fi

if git fetch --tags &>/dev/null; then
    echo "Synchronizing tags..."
    sleep 1
else
    echo "$RED ERROR synchronizing tags $NC"
    exit 1;
fi

CURRENT_VERSION=$(git describe --abbrev=0 --tags) # gets tag from current branch

major=$(echo $CURRENT_VERSION | cut -d'.' -f 1 | cut -d'v' -f 2)
minor=$(echo $CURRENT_VERSION | cut -d'.' -f 2)
patch=$(echo $CURRENT_VERSION | cut -d'.' -f 3)

if [ -z "${major}" ] || [ -z "${minor}" ] || [ -z "${patch}" ]
then
    echo -e "$RED WARNING: <$major>.<$minor>.<$patch> is bad set or set to the empty string $NC \n"
    exit 1;
fi

case "$VERSION_LABEL" in
    --major )
        major=$(expr $major + 1)
        minor=0
        patch=0
        ;;

    --minor )
        minor=$(expr $minor + 1)
        patch=0
        ;;

    --patch )
        patch=$(expr $patch + 1)
        ;;

    * )
        exit 1
        ;;
esac

NEXT_VERSION=v$major.$minor.$patch

echo "############################"
echo -e "$BOLD REPOSITORY:$NC $REPOSITORY"
echo -e "$BOLD TAG:$NC $CURRENT_VERSION ->$GREEN $NEXT_VERSION $NC"
echo -e "$BOLD VERSION:$NC $VERSION_LABEL"
echo -e "$BOLD CHANGELOG:$NC"
sh "$MY_DIR/generate_changelog.sh"
echo "############################"

read -r -p "Would you like to push the tag [y|n]?" response
if [[ $response =~ ^(yes|Y|y) ]]; then
    git tag -a $NEXT_VERSION -m ""
    git push origin $NEXT_VERSION
    echo "Done 🍻"
else
    echo "Aborted"
    exit 1;
fi


