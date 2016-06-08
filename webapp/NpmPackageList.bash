#!/bin/bash
for p in  `cat ../MedBook-Telescope3/NpmPackageList.txt`
do
    echo $p
    npm install $p
done
