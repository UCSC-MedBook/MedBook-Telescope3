#!/bin/csh
foreach p ( `cat NpmPackageList.txt`)
    echo $p
    npm install $p
end
