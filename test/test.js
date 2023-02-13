/* eslint-disable @typescript-eslint/no-var-requires */
const path = require( "path" )
const fs = require( "fs-extra" ) // note this script adds the fs.cd() method!
const open = require( "open" )
const moment = require( "moment" )
const globby = require( "globby" )

{ // globals factory

    { // [[return:string] function] RegExp.escape(): escapes all special regex characters in an input string

        RegExp.escape = pattern => {
            return pattern.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
        }

    }

    { // [array] global.args: parsed arguments for script

        const args = process.argv.slice()

        if( args[0] == "node" )
            args.shift()

        while( -1 < args.findIndex( argument => {

            return RegExp( `${
                RegExp.escape( path.basename(__filename) )
            }$`).test( argument )

        })){
            args.shift()
        }

        global.args = args

    }

    { // [function] global.shell(): wrapper function for execSync

        const execSync = require( "child_process" ).execSync
    
        global.shell = command =>{
            return execSync( command ).toString().trim()
        }

    }

    { // [function] global.savefile() and global.loadfile(): wrapper functions for writeFileSync and readFileSync

        global.loadfile = path => {
            return fs.readFileSync( path, { 'encoding' : 'utf8' }).toString().trim()
        }

        global.savefile = ( path, data, flag="w" ) =>{
            return fs.writeFileSync( path, data, { 'encoding' : 'utf8', 'flag' : flag })
        }

    }

    { // [function] fs.cd(): wrapper function for process.chdir()

        fs.cd = process.chdir

    }

}

const ENV = {
    "BRANCH" : {
        "DEFAULT"  : "main",
        "DETECTED" : global.shell( "git rev-parse --abbrev-ref HEAD" ),
        "ARGUMENT" : global.args[1]
    },
    "TESTFILE" : {
        "DEFAULT"  : "README.md",
        "ARGUMENT" : global.args[0]
    },
    "APPDATA" : {
        "OBSIDIAN" : `${
            process.env.APPDATA || 
                ( process.platform == 'darwin' ?
                    process.env.HOME + '/Library/Application Support' :
                    process.env.HOME + "/.config" )
        }/obsidian`
    },
    "GIT" : {
        "ROOT" : global.shell( "git rev-parse --show-toplevel" )
    },
    "TIMESTAMP" : moment()
}

ENV.BRANCH   .SELECTED = ENV.BRANCH   .ARGUMENT || ENV.BRANCH.DETECTED || ENV.BRANCH.DEFAULT
ENV.TESTFILE .SELECTED = ENV.TESTFILE .ARGUMENT || ENV.TESTFILE.DEFAULT

ENV.GIT.NAME = path.basename( ENV.GIT.ROOT ) // this is the plugin's name

// identify test by branch name and timestamp
// - this is also the name of the unit test folder

ENV.ID = `${ ENV.BRANCH.SELECTED }-${ ENV.TIMESTAMP.format('mm.dd.yyyy-HH.MM.SS') }`

// ensure test directory and cd into it

fs.ensureDirSync( `${ ENV.GIT.ROOT }/test/${ ENV.ID }` );
fs.cd(            `${ ENV.GIT.ROOT }/test/${ ENV.ID }` );

// the root of this repository is a vault
// setup test using the above vault on the (argument-provided) branch
// - remove the test directory (prevents circular testing)
// - optionally remove the docs directory

global.shell( `git clone ${ ENV.GIT.ROOT } .` )
global.shell( `git switch ${ ENV.BRANCH.SELECTED } 2>/dev/null || global switch -c ${ ENV.BRANCH.SELECTED }` )
global.shell( 'npm install' )
global.shell( 'npm run dev' )

fs.removeSync( 'test' )
// fs.removeSync( 'docs' )

// setup the plugin via copy (copy the modified root directory to the core of the plugin)

fs.ensureDirSync( `.obsidian/plugins/${ ENV.GIT.NAME }` )

// copy the entire root directory except the test, docs (optional - see above), and .obsidian folders to the plugins directory

globby.sync( "./!(.obsidian)" ).forEach( file => {

    fs.copy( file, `.obsidian/plugins/${ ENV.GIT.NAME }/${ file }` )

})

// the rest of the code (except the last line) adds the new vault to obsidian's internal vault tracker

// write '{}' to obsidian's vault tracker if it doesn't exist or if it is empty (== '')
try{ global.savefile( `${ ENV.APPDATA.OBSIDIAN }/obsidian.json`, '{}', 'wx' ) } catch { /* Errors are expected */ }
if( global.loadfile(  `${ ENV.APPDATA.OBSIDIAN }/obsidian.json` ) == '' )
    global.savefile(  `${ ENV.APPDATA.OBSIDIAN }/obsidian.json`, '{}' )

// get vaults list (hash table) from obsidian's vault tracker

let { vaults } = require( `${ ENV.APPDATA.OBSIDIAN }/obsidian.json` )

// if the vaults list is empty/null, create it

if( !vaults )
    vaults = {}

// add the vault entry
// - obsidian URI starts by checking the vault tracker for this:

vaults[ ENV.ID ] = {
    "path" : process.cwd(),
    "ts" : ENV.TIMESTAMP.toDate().getTime()
}

global.savefile(
    `${ ENV.APPDATA.OBSIDIAN }/obsidian.json`,
    JSON.stringify({ "vaults": vaults }))

// create a vault cache
// - this is the second thing that the obsidian URI looks for:

global.savefile(
    `${ ENV.APPDATA.OBSIDIAN }/${ ENV.ID }.json`,
    JSON.stringify({
        "x": 0,
        "y": 0,
        "width" : 600,
        "height" : 800,
        "isMaximized" : true,
        "devTools" : true,
        "zoom" : 0
    }))

// Open the new vault using the URI

open( `obsidian://open?path=${ process.cwd() }/${ ENV.TESTFILE.SELECTED }` )