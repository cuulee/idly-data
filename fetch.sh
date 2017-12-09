timestamp() {
 date '+%Y-%m-%d %H:%M:%S'
}

rm -r id-data
rm -r id-locales
git clone --depth=1  https://github.com/openstreetmap/iD.git temp
cp -r temp/data id-data
cp -r temp/dist/locales id-locales
rm -rf temp


timestamp > last-update.txt

