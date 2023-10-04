cd packages

echo 'Removing @hz dependencies ...'
find -E ./ -type f -regex '.*package\.json' -exec sed -i '.bak' '/"@hz\//d' {} \;
find . -name '*.bak' -type f -delete
find . -name 'owners.yml' -type f -delete
rm -rf add-on-manifest/config
rm -rf wxp-core/config
rm -rf wxp-ssl/config
rm -rf wxp-add-on-scaffolder/config
rm -rf wxp-scripts/config
rm -rf create-ccweb-add-on/config
rm -rf wxp-analytics/config
rm -rf wxp-developer-terms/config
rm -rf wxp-sdk-typings/config
echo $'Done!\n'

echo 'Removing lint scripts ...'
find -E ./ -type f -regex '.*package\.json' -exec sed -i '.bak' '/"lint/d' {} \;
find . -name '*.bak' -type f -delete
echo $'Done!\n'

echo 'Removing _phase scripts ...'
find -E ./ -type f -regex '.*package\.json' -exec sed -i '.bak' '/"_phase:/d;' {} \;
find . -name '*.bak' -type f -delete
echo $'Done!\n'

echo 'Fixing package.json ...'
find -E ./add-on-manifest -type f -regex '.*package\.json' -exec sed -i '.bak' 's/branches 100",/branches 100"/g' {} \;
find ./add-on-manifest -name '*.bak' -type f -delete

find -E ./create-ccweb-add-on -type f -regex '.*package\.json' -exec sed -i '.bak' 's/branches 100",/branches 100"/g' {} \;
find ./create-ccweb-add-on -name '*.bak' -type f -delete

find -E ./wxp-analytics -type f -regex '.*package\.json' -exec sed -i '.bak' 's/branches 100",/branches 100"/g' {} \;
find ./wxp-analytics -name '*.bak' -type f -delete

find -E ./wxp-developer-terms -type f -regex '.*package\.json' -exec sed -i '.bak' 's/branches 100",/branches 100"/g' {} \;
find ./wxp-developer-terms -name '*.bak' -type f -delete

find -E ./wxp-add-on-scaffolder -type f -regex '.*package\.json' -exec sed -i '.bak' 's/branches 100",/branches 100"/g' {} \;
find ./wxp-add-on-scaffolder -name '*.bak' -type f -delete

find -E ./wxp-core -type f -regex '.*package\.json' -exec sed -i '.bak' 's/branches 100",/branches 100"/g' {} \;
find ./wxp-core -name '*.bak' -type f -delete

find -E ./wxp-scripts -type f -regex '.*package\.json' -exec sed -i '.bak' 's/branches 100",/branches 100"/g' {} \;
find ./wxp-scripts -name '*.bak' -type f -delete

find -E ./wxp-ssl -type f -regex '.*package\.json' -exec sed -i '.bak' 's/branches 100",/branches 100"/g' {} \;
find ./wxp-ssl -name '*.bak' -type f -delete

find -E ./wxp-sdk-typings -type f -regex '.*package\.json' -exec sed -i '.bak' 's/"test": "",/"test": ""/g' {} \;
find ./wxp-sdk-typings -name '*.bak' -type f -delete
echo $'Done!\n'

echo 'Removing eslint configurations ...'
find . -name '.eslintignore' -type f -delete
find . -name '.eslintrc' -type f -delete
find . -name '.eslintcache' -type f -delete
echo $'Done!\n'