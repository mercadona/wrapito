#!/bin/bash

PROJECT_NAME=$(cat package.json \
  | grep name \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

[ -z "$PROJECT_NAME" ] && PROJECT_NAME="Boilerplate App"

title=$(git tag --points-at) # Get the current tag, if it exists
first_tag=$(git describe --tags --abbrev=0 @^) # Get the most recent tag

DATE=$(date +%Y-%m-%d)

# When you are on HEAD and the tag doesnt exist, we set a default title
if [[ ! $title ]]
then
  title="HEAD"
fi

log=$(git log $first_tag..@ --reverse --format='++%s' --no-merges)

title_string="$PROJECT_NAME $title ($DATE)"
title_length=${#title_string}

for i in $(seq 1 $title_length); do printf "="; done
echo
echo "$title_string"
for i in $(seq 1 $title_length); do printf "="; done
echo

keys=("Added" "Changed" "Deprecated" "Removed" "Fixed" "Security")

OLDIFS=$IFS
IFS=++

for tag in ${keys[@]}; do
  lines=()
  for logLine in $log; do
    lines+=( `echo "$logLine" \
      | grep -e "\[${tag}\]" \
      | sed "s/\[${tag}\] //"`)
  done
  if [ ${#lines[@]} -ne 0 ]; then
    echo "* $tag:"
    last_line=${lines[${#lines[@]}-1]}
    unset 'lines[${#lines[@]}-1]'
    if [ ${#lines[@]} -gt 0 ]; then
      for line in ${lines[*]}; do
        echo "  ├── $line"
      done
    fi
    echo "  └── $last_line"
  fi
done

other_lines=()
for logLine in $log; do
  other_lines+=( `echo "$logLine" | grep -v -e "\[*\]"`)
done
if [ ${#other_lines[@]} -ne 0 ]; then
  echo "* Other:"
  other_last_line=${other_lines[${#other_lines[@]}-1]}
  unset 'other_lines[${#other_lines[@]}-1]'
  if [ ${#other_lines[@]} -gt 0 ]; then
    for other_line in ${other_lines[*]}; do
      echo "  ├── $other_line"
    done
  fi
  echo "  └── $other_last_line"
fi


IFS=$OLDIFS