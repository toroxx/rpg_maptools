



const pjson = require('../package.json');
const path = require('path');
const url = require('url');
const fs = require('fs');
const sizeOf = require('image-size');

const querystring = require('querystring');
const electron = require('electron');
const { remote } = electron;
const { Menu, MenuItem } = remote;

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Dialogs = require('dialogs')
const dialogs = Dialogs()

function exec(path, callback) {
    const exec = require('child_process').exec;
    exec(path, callback);
}

function load_datastore(options) {
    const Datastore = require('nedb');
    return new Datastore(options);
}

window.env = process.env;

