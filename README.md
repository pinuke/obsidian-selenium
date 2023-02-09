# `obsidian-selenium` Plugin Developer Docs

## Plugin User Docs:
WIP

## Unit Testing:

The root of this git repository is not only setup as a plugin, but additionally setup as a vault. It can be forked and cloned for use in testing the plugin

Included with this repository is a `test/run.sh` bash script for automatically cloning this repository and opening it in obsidian while loading it as a plugin

### Syntax:

```
cd test
.run.sh $brachname $path
```

#### `$branchname`:
- name of the branch that you would like to test. Default: `"main"`

#### `$path`:
- relative path from the vault root to the testfile that you would like to have open when obsidian launches. Default: `"README.md"`