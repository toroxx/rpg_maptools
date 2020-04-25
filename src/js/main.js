'use strict';
import '../scss/main.scss';

import React from "react";
import ReactDOM from 'react-dom';
import MainView from './View/MainView';
import * as Util from './Lib/Util';


let elements = Util.load_asset_resources('elements');

const root = document.querySelector('#root');
ReactDOM.render(<MainView elements={elements} db={db} />, root);