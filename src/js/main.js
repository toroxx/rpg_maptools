'use strict';
import '../scss/main.scss';

import React from "react";
import ReactDOM from 'react-dom';
import MainView from './View/MainView';
import * as Util from './Lib/Util';

const { app: ele_app, BrowserWindow, ipcRenderer, Menu } = electron.remote;
const rootpath = ele_app.getAppPath();

const assets_path = path.join(rootpath, '/assets/');
let elements = Util.load_asset_resources('elements');

const root = document.querySelector('#root');
ReactDOM.render(<MainView elements={elements} />, root);