#!/bin/sh
git checkout master
git add .
git config --global push.default simple
git commit --amend -C HEAD
git push
