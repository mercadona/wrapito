#!/bin/bash

APP_NAME=$(cat package.json \
  | grep name \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

[ -z "$APP_NAME" ] && APP_NAME="Boilerplate App"

version=$1
DATE=$(date +%Y-%m-%d)
keys=("Added" "Changed" "Deprecated" "Removed" "Fixed" "Security")

first_tag=$(git describe --tags $(git rev-list --tags --max-count=1))
second_tag=$(git tag --sort=-version:refname | head -n 2)

[[ -z "$version" ]] && log=$(git log $first_tag..HEAD --format='++%s' --no-merges 2>&1)
[[ -n "$version" ]] && log=$(git log $second_tag..$first_tag --format='++%s' --no-merges 2>&1)

OLDIFS=$IFS
IFS=++

echo "====================================="
echo "$APP_NAME $version ($DATE)"
echo "====================================="
for tag in ${keys[@]}; do
  lines=()
  for logLine in $log; do
    lines+=( `echo "- $logLine" \
      | grep -e "\[${tag}\]" \
      | sed "s/\[${tag}\] //"`)
  done

  if [ ${#lines[@]} -ne 0 ]; then
    echo "${tag}"

    for line in ${lines[*]}; do
      echo $line
    done

    echo ""
  fi
done

IFS=$OLDIFS