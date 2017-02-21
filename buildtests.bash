(set -o igncr) 2>/dev/null && set -o igncr; # For Cygwin on Windows compaibility
bash build.bash

rm -rf tests
mkdir tests
mkdir tests/data
mkdir tests/resources

if [[ "$OSTYPE" == "linux-gnu" ]]; then
    cp -r phat-linux-x64/resources/* tests/resources
    cp phat-linux-x64/resources/app/tests.js tests
fi
if [[ "$OSTYPE" == "cygwin" ]]; then
    cp -r phat-win32-x64/resources/* tests/resources
    cp phat-win32-x64/resources/app/tests.js tests
fi
cp -r testData/* tests/data

mkdir guiTests

for f in src/guiTests/*.js
do
	printf "Bundling "
	printf $f
	printf "\n"
	destination=$(echo $f | awk '{gsub("src/","guiTests/"); gsub("guiTests/guiTests/","guiTests/");print}')
	printf $destination
	./node_modules/.bin/browserify $f --node --debug -o $destination --ignore-missing
done
