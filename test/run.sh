[[ $1 -ne "" ]] && branch=$1 || branch="main"
unit_pathleaf="$branch-$(date +"%m.%d.%y-%H:%M:%S")"
mkdir $unit_pathleaf

[[ $2 -ne "" ]] && testfile=$2 || testfile="README.md"

cd "$unit_pathleaf"
git clone "$(git config --get remote.origin.url)" .
git switch $branch 2>/dev/null || git switch -c $branch;
rm -r test
# rm -r docs
mkdir .obsidian/plugins
cd .obsidian/plugins

extglob_status=$(echo "$(shopt extglob)" | grep -o ..$)
extglob_flag=false
if [[ "$extglob_status" != "on" ]]; then
    extglob_flag=true
    shopt -s extglob
fi

cp -r ../../!(".obsidian") .

if [[ $extglob_flag ]]; then
    shopt -u extglob
fi

cd ../..

# add vault to obsidian's internal vault tracker:

temp_files="$(echo ~)/.config/obsidian"
test -f "$temp_files/obsidian.json" || echo "{}" > "$temp_files/obsidian.json"
if [[ "$(cat "$temp_files/obsidian.json")" == "" ]]; then
    echo "{}" > "$temp_files/obsidian.json"
fi

node -e "$( cat << EOF
    let { vaults } = require( "$temp_files/obsidian.json" )
    if( !vaults ){
        vaults = {}
    }
    let vault = vaults[ "$unit_pathleaf" ] = {
        "path" : "$(pwd)",
        "ts" : $(date +%s%3N)
    }
    json = JSON.stringify({ "vaults": vaults })
    fs.writeFileSync( "$temp_files/obsidian.json", json, 'utf8' )
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
    fs.writeFileSync( "$temp_files/$unit_pathleaf.json", json, 'utf8' )
EOF
)"

xdg-open "obsidian://open?path=$(pwd)/$testfile" </dev/null &>/dev/null &