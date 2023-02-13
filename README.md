# `obsidian-selenium` Plugin Developer Docs

## Plugin User Docs:
- see [Obsidian-Selenium User Docs](https://smartguy1196.github.io/obsidian-selenium)

## Repository Structure:

### `.obsidian/` Directory:

This plugin also happens to be its own vault. This is for testing and convenience for the developer. In the root of the repository, this folder is (for the most part) "vanilla" with no plugins loaded.

However, the vaults (or copies of this repo) loaded into the `test/` directory using the `test/test.js` script will have this plugin loaded automatically by the script.
- see [Unit Testing](#unit-testing)

### `docs/` Directory:
The directory where the source .md files for the Github Pages instance of this repo live. These docs are the user-facing docs.
- see [Plugin User Docs](#plugin-user-docs)

If you would like to see how I wrote the Plugin User Docs, see the [Just the Docs documentation](https://just-the-docs.github.io/just-the-docs/) and [my custom implementation of the gh-pages action](https://github.com/smartguy1196/obsidian-selenium/blob/main/.github/workflows/pages.yml). I'm happy to share how I built it.

### `test/` Directory:
- see [Unit Testing](#unit-testing)
- removed from Unit Tests, to prevent circular testing

## Unit Testing:

The root of this git repository is not only setup as a plugin, but conveniently setup as a vault for unit testing!

Included with this repository is a `test/test.js` node.js script for automatically setting up the repo-vault and opening it in obsidian with it loaded as a plugin!

### `test.js` Usage:

This script automatically:
- clones this repository into the test directory under the name `$branchname-$timestamp`. 
- removes the test folder from the clone (prevents circular-testing lol). 
- opens the vault using [the method described on one of my Obsidian Forum Thread](https://forum.obsidian.md/t/using-the-obsidian-appdata-folder-for-unit-testing/54241)

#### Syntax:

```bash
node ./test/test.js $path $brachname
```

##### `$path`:
- relative path from the vault root to the testfile that you would like to have open when obsidian launches. Default: `"README.md"`

##### `$branchname`:
- name of the branch that you would like to test. Default: `"main"`

#### Logging:

This script uses custom logging and uses a lot of it, so that developers can get a better idea as to why their test build failed.

##### Yellow Labels:

Sections of the build script that are likely to break are printed in yellow, and the messages are underlined.

##### Magenta Labels:

These are help/manual dialogs

##### Blue/Cyan Labels:

These are used for debugging and tracing respectively

##### Red Labels:

These are used for errors. There are 2 types: "Error" and "Fatal."
- Fatal errors will kill the process to prevent further damage to the build

#### Developer Notes:

One particular yellow label that is important is the label for closing the leveldbs. Leveldbs use lockfiles and can only be opened by one process at a time. This means that all applications/processes using leveldb must not be running, and must have closed the leveldb *before running the test script*

In the `test/test.js` file, just after that yellow label is a comment on how to start troubleshooting the lock. It isn't a one-size-fits-all solution, but it should get you going in the right direction.