$branch = [[ $1 ]] && $1 || "main"
mkdir "$branch-$(date +"%m.%d.%y-%H:%M:%S")"
cd "$branch-$(date +"%m.%d.%y-%H:%M:%S")"
cp ../../.obsidian .obsidian
git clone -b $1 https://github.com/smartguy1196/obsidian-selenium .obsidian/plugins
xdg-open "obsidian://open?path=$(pwd)" </dev/null &>/dev/null &