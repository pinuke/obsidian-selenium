# `obsidian-selenium` Plugin Developer Docs

## Plugin User Docs:
WIP

## Repository Structure:

### `.obsidian/` Directory:

This plugin also happens to be its own vault. This is for testing and convenience for the developer. In the root of the repository, this folder is (for the most part) "vanilla" with no plugins loaded.

However, the vaults (or copies of this repo) loaded into the `test/` directory using the `test/run.sh` script will have this plugin loaded automatically by the script.
- see [Unit Testing](#unit-testing)

### `docs/` Directory:
The directory where the source .md files for the Github Pages instance of this repo live. These docs are the user-facing docs.
- see [Plugin User Docs](#plugin-user-docs)

### `test/` Directory:
- see [Unit Testing](#unit-testing)
- removed from Unit Tests, to prevent circular testing

## Unit Testing:

The root of this git repository is not only setup as a plugin, but conveniently setup as a vault for unit testing!

Included with this repository is a `test/run.sh` bash script for automatically setting up the repo-vault and opening it in obsidian with it loaded as a plugin!

### `run.sh` Usage:

```bash
cd test
./run.sh $brachname $path
```

#### `$branchname`:
- name of the branch that you would like to test. Default: `"main"`

#### `$path`:
- relative path from the vault root to the testfile that you would like to have open when obsidian launches. Default: `"README.md"`