#!/usr/bin/env bash

echo "now at $1"

original_name="musakui/kotori-netlify"

for filename in $(git ls-files); do
	sed -i "s|$original_name|$1|g" $filename
	echo "updated $filename"
done

mv .github/NEW_README.md README.md

rm -rf .github
rm -rf docs
