rm -f ./doc/graph/*.png
for FILENAME in $(ls -F contracts | grep -v '[/@=|]$')
do
    ./node_modules/.bin/solgraph ./contracts/$FILENAME | dot -Tpng > ./doc/graph/$FILENAME.png
done