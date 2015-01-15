#!/bin/bash
for p in  `cat NpmPackageList.txt`
do
    echo $p
    npm install $p
done
