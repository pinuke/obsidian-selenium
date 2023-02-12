CurrentBranch="$(git rev-parse --abbrev-ref HEAD)"

[[ $1 -ne "" ]] && testfile="$1" || testfile="README.md"
[[ $2 -ne "" ]] && branch="$2" || [[ $CurrentBranch -ne "" ]] && branch="$CurrentBranch" || branch="main"

AppData="$(echo ~)/.config/obsidian" # location of Obsidian's AppData on Linux

# identify test by branch name and timestamp

ID="$branch-$(date +"%m.%d.%y-%H:%M:%S")"

# create and cd into test directory

mkdir $ID
cd "$ID"

# the root of this repository is a vault
# setup test using the above vault on the (argument-provided) branch
# - remove the test directory (prevents circular testing)
# - optionally remove the docs directory

git clone "$(git config --get remote.origin.url)" .
git switch $branch 2>/dev/null || git switch -c $branch;
rm -r test
# rm -r docs

# setup the plugin

mkdir .obsidian/plugins
cd .obsidian/plugins

# enable the glob extensions shell option (shopt -s extglob)
# - necessary since the `cp` command doesn't allow you to copy from a parent directory
#   - (i.e.) `cp` won't allow copying of .obsidian from the parent into the plugin

# start by getting status of the shell option:

extglob_status=$(echo "$(shopt extglob)" | grep -o ..$)
extglob_flag=false

# enable it, only if required

if [[ "$extglob_status" != "on" ]]; then
    extglob_flag=true
    shopt -s extglob
fi

cp -r ../../!(".obsidian") .

# disable it only if it was enabled during script execution

if [[ $extglob_flag ]]; then
    shopt -u extglob
fi

# end of plugin setup. return to root directory:

cd ../..

# the rest of the code (except the last line) adds the new vault to obsidian's internal vault tracker

# make sure that obsidian has a vault tracker:
test -f "$AppData/obsidian.json" || echo "{}" > "$AppData/obsidian.json"
if [[ "$(cat "$AppData/obsidian.json")" == "" ]]; then
    echo "{}" > "$AppData/obsidian.json"
fi

# update the vault tracker using node (node used instead of bash for JSON parsing)
node -e "$( cat << EOF

    // get vaults from obsidian's vault tracker

    let { vaults } = require( "$AppData/obsidian.json" )

    // if the vaults object is empty/null, create it

    if( !vaults ){
        vaults = {}
    }

    // add the vault entry
    // - obsidian URI starts by checking the vault tracker for this:

    let vault = vaults[ "$ID" ] = {
        "path" : "$(pwd)",
        "ts" : $(date +%s%3N)
    }
    json = JSON.stringify({ "vaults": vaults })
    fs.writeFileSync( "$AppData/obsidian.json", json, 'utf8' )

    // create a vault cache
    // - this is the second thing that the obsidian URI looks for:

    let vault_cache = {
        "x": 0,
        "y": 0,
        "width" : 600,
        "height" : 800,
        "isMaximized" : true,
        "devTools" : true,
        "zoom" : 0
    }
    json = JSON.stringify(vault_cache)
    fs.writeFileSync( "$AppData/$ID.json", json, 'utf8' )

EOF
)"

# Open the new vault using the URI

xdg-open "obsidian://open?path=$(pwd)/$testfile" </dev/null &>/dev/null &