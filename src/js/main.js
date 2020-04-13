'use strict';
import '../scss/main.scss';

import React from "react";
import ReactDOM from 'react-dom';
import MainView from './View/MainView';


const { app: ele_app, BrowserWindow, ipcRenderer } = electron.remote;
const rootpath = ele_app.getAppPath();

const assets_path = path.join(rootpath, '/assets/');

let cache = {};
let imgs = {
    'BBPAOutsideA': ['BBPA_Outside_A.png', 16, 48],
    'BBPAOutsideAyogore': ['BBPA_Outside_Ayogore.png', 16, 48],
    'BBPAOutsideB': ['BBPA_Outside_B.png', 16, 48],
    'BBPAOutsideByogore': ['BBPA_Outside_Byogore.png', 16, 48],
    'BBakiOutsideA2': ['BB_aki_Outside_A2.png', 16, 48],
    'BBsyunkasyuutou': ['BB_syunkasyuutou.png', 16, 48],
    'fire': ['fire.png', 12, 48],
    'inakayuka': ['inakayuka.png', 16, 48],
    'inakayuka1': ['inakayuka1.png', 16, 48],
    'inakayuka2': ['inakayuka2.png', 16, 48],
    'SCDoorSchl02': ['SC-Door-Schl02.png', 8, 32],
    'SPTGym01': ['SPT-Gym01.png', 8, 32],
    'STOfficeI01': ['ST-Office-I01.png', 8, 32],
    'STSchlE01': ['ST-Schl-E01.png', 8, 32],
    'STSchlGym': ['ST-Schl-Gym.png', 4, 32],
    'STSchlI01': ['ST-Schl-I01.png', 8, 32],
    'STSchlI02': ['ST-Schl-I02.png', 8, 32],
    'STToiletI0': ['ST-Toilet-I01.png', 8, 32]
};
let selected_tile = null;
let preload = {};


function hiddenlines() {
    let styles = ['non_walkover', 'non_moveleft', 'non_moveright', 'non_moveup', 'non_movedown'];
    styles.forEach(e => {
        document.querySelectorAll('.' + e).forEach(p => {
            p.style.borderWidth = "0px";
        });
    })
}
function showlines() {
    let styles = ['non_walkover', 'non_moveleft', 'non_moveright', 'non_moveup', 'non_movedown'];
    styles.forEach(e => {
        document.querySelectorAll('.' + e).forEach(p => {
            p.style.borderWidth = "3px";
        });
    })
}
function insertMapRow() {
    if (data.map && data.map[0]) {
        let cols = data.map[0].length;
        let new_row = [];
        for (let i = 0; i < cols; i++) {
            new_row.push('-void-');
        }

        data.map.unshift(new_row);
        loadMap();
        return;
    }
}
function insertMapCol() {
    for (let y in data.map) {
        data.map[y].unshift('-void-');
    }
    loadMap();
}
function addMapRow() {
    if (data.map && data.map[0]) {
        let cols = data.map[0].length;
        let new_row = [];
        for (let i = 0; i < cols; i++) {
            new_row.push('-void-');
        }

        data.map.push(new_row);
        loadMap();
        return;
    }

    data.map = [['-void-']];
    loadMap();
}
function addMapCol() {
    for (let y in data.map) {
        data.map[y].push('-void-');
    }
    loadMap();
}

function copyMapRow() {
    if (selected_tile != null && selected_tile[2] != undefined) {
        let y = selected_tile[2];

        window.prompt('To Row', nx => {
            if (nx == null) {
                return;
            }

            nx = parseInt(nx, 10);
            console.log(nx);
            let results = [];
            for (let p in data.map) {

                if (parseInt(p) != nx) {
                    results.push(data.map[p]);
                } else {
                    results.push(data.map[y]);
                }
            }
            data.map = results;
        });

    } loadMap();
}
function copyMapCol() {
    if (selected_tile != null && selected_tile[1] != undefined) {
        let x = selected_tile[1];
        console.log(x);

        window.prompt('To Col', nx => {
            if (nx == null) {
                return;
            }

            nx = parseInt(nx, 10);

            let results = [];
            for (let y in data.map) {

                let tmp = [];
                for (let px in data.map[y]) {
                    if (parseInt(px) != nx) {
                        tmp.push(data.map[y][px]);
                    } else {
                        tmp.push(data.map[y][x]);
                    }
                }
                results.push(tmp);
            }
            data.map = results;
        });

    } loadMap();
}

function removeMapRow() {
    if (selected_tile != null && selected_tile[2] != undefined) {
        let y = selected_tile[2];

        let results = [];
        for (let p in data.map) {
            if (p != y) {
                results.push(data.map[p]);
            }
        }
        data.map = results;
    } loadMap();
}
function removeMapCol() {
    if (selected_tile != null && selected_tile[1] != undefined) {
        let x = selected_tile[1];

        let results = [];
        for (let y in data.map) {

            let tmp = [];
            for (let px in data.map[y]) {
                if (px != x) {
                    tmp.push(data.map[y][px]);
                }
            }
            results.push(tmp);
        }
        data.map = results;
    } loadMap();
}

function preload_img() {
    for (let code in imgs) {
        let [file, tile_count] = imgs[code];
        const img = document.createElement('img');
        document.body.appendChild(img);

        img.src = assets_path + '/elements/' + file;
        img.style.display = 'none';
        img.onload = function () {
            preload[code] = [assets_path + '/elements/' + file, img.width, img.height];
        }
    }
}

// window.location;
let options = { 'walkover': 0, 'movedown': 1, 'moveleft': 1, 'moveup': 1, 'moveright': 1 };
let data = {
    "map": [
        ['-void-', '-void-'],
        ['-void-', '-void-']
    ],
    "item": { "-void-": { layers: null } }
};



function createitem() {
    let itemForm = document.querySelector(".itemForm");
    itemForm.style.display = 'block';

    let layers = itemForm.querySelector('.layers');
    load_layers(layers, []);
    load_options(itemForm.querySelector('.options'), options);
}

function edititem(code) {
    if (code == '-void-') {
        return;
    }

    let itemForm = document.querySelector(".itemForm");
    itemForm.style.display = 'block';
    itemForm.querySelector('input[name=id]').value = code;

    let option_layer = data.item[code]['layers'];
    let option_opt = data.item[code];
    let layers = itemForm.querySelector('.layers');
    let options = itemForm.querySelector('.options');

    load_layers(layers, option_layer);
    load_options(options, option_opt);
}

function saveitem() {
    let itemForm = document.querySelector(".itemForm");
    itemForm.style.display = 'none';

    let code = itemForm.querySelector('input[name=id]').value;
    let options = { 'layers': [] };

    itemForm.querySelectorAll('.layer').forEach(e => {
        options['layers'].push({
            'bg': e.querySelector('.bg').value,
            'id': e.querySelector('.id').value,
            'zIndex': e.querySelector('.zIndex').value,
        });
    });
    itemForm.querySelectorAll('.opt').forEach(e => {
        let input = e.querySelector('input');
        options[input.name] = input.checked;
    });
    if (code == "") {
        alert("Code cannot be null");
        return;
    }
    data.item[code] = options;
    loadMap();
}
function addlayer() {
    let itemForm = document.querySelector(".itemForm");
    let layers = itemForm.querySelector('.layers');

    let newlayer = document.createElement('div');
    newlayer.className = 'layer';

    let html = "";
    html += 'BG <select class="bg" >';
    for (let k in imgs) {
        html += '<option>' + k + '</option>';
    }
    html += '</select>';
    html += ' ID: <input style="width: 50px;" type="text" class="id" value=""  />';
    html += ' zIndex: <input style="width: 50px;" type="text" class="zIndex" value="1"  />';
    html += '<button onclick="removelayer(this)">Remove</button>';

    newlayer.innerHTML += html;
    layers.appendChild(newlayer);
}
function removelayer(target) {
    target.parentNode.parentNode.removeChild(target.parentNode);
}

function load_layers(target, tile_layers) {
    let html = "";
    let i = 0;
    for (let k in tile_layers) {
        const { bg, id, zIndex = 1 } = tile_layers[k];
        html += '<div class="layer">';
        html += 'BG <select class="bg" >';
        for (let k in imgs) {
            html += '<option ' + (bg == k ? 'selected' : "") + '>' + k + '</option>';
        }
        html += '</select>';
        html += 'ID: <input style="width: 50px;" type="text" class="id" value="' + id + '"  />';
        html += 'zIndex: <input style="width: 50px;" type="text" class="zIndex" value="' + zIndex + '"  />';
        html += '<button class="remove(this)">Remove</button>'
        html += '</div>';
        i++;
    }


    target.innerHTML = html;
}

function load_options(target, tile_options) {

    let html = "";
    for (let k in options) {
        html += '<div class="opt"><b>' + k + ':</b> ';
        html += '<input name="' + k + '" type="checkbox" value="1" ' + (tile_options[k] ? 'checked' : '') + ' />';
        html += '</div>';
    }
    target.innerHTML = html;
}


function setitem(code) {
    if (selected_tile == null || selected_tile[0] == null) {
        return;
    }
    const tile = selected_tile[0].getAttribute('tile_id');
    selected_tile[0].className.replace(tile, code);
    selected_tile[0].setAttribute('tile_id', code);

    const x = selected_tile[1];
    const y = selected_tile[2];
    data.map[y][x] = code;

    refresh_tile(selected_tile[0], code);
}

function loadMap() {
    genItemList();

    load_map();
    load_tile();
}

function select_tile(target, x, y) {
    document.querySelectorAll('.tile.selected').forEach(e => {
        e.className = e.className.replace('selected', '');
    });
    document.querySelector('span.selected').innerHTML = '';

    if (selected_tile != null && selected_tile[0] == target) {
        selected_tile = null;
        return;
    }

    target.className = target.className + ' selected ';
    document.querySelector('span.selected').innerHTML = 'X: ' + x + ' Y: ' + y;
    selected_tile = [target, x, y];
}

function load_map() {
    let containers = document.querySelector('.tiles');

    let html = '';
    for (let y in data.map) {
        html += '<div class="row">';
        for (let x in data.map[y]) {
            const tile_id = data.map[y][x];
            html += '<div onclick="select_tile(this, ' + x + ',' + y + ')" tile_id="' + tile_id + '" class="col tile ' + tile_id + ' tile_' + x + '_' + y + '">';
            html += '</div>';
        }
        html += '</div>';
    }
    containers.innerHTML = html;
}
function genItemList() {
    const itemlist = document.querySelector('.itemlist')
    itemlist.innerHTML = '';

    const ordered = {};
    Object.keys(data.item).sort().forEach(function (key) {
        ordered[key] = data.item[key];
    });
    data.item = ordered;
    for (let k in data.item) {
        const i = data.item[k];
        const itemHTML = additem(k, i);
        itemlist.appendChild(itemHTML);
    }
}


function load_tile() {

    for (let k in data.item) {
        const i = data.item[k];

        let html = "";

        if (i['layers'] != null) {
            let layers = i['layers'];
            for (let i = 0; i < 5; i++) {
                if (layers[i] == undefined) {
                    continue;
                }
                let { bg = null, id = null } = layers[i];
                if (bg == null || id == null) {
                    continue;
                }

                let tile_per_row = imgs[bg][1];
                let tile_size = imgs[bg][2];
                const row = Math.floor(id / tile_per_row) * 75;
                const col = (id % tile_per_row) * 75;
                const scale = 75 / tile_size;
                const img_width = preload[bg][1];
                html += '<img style="width: ' + (img_width * scale) + 'px;left: -' + col + 'px; top: -' + row + 'px;" src="' + preload[bg][0] + '" ';
                html += ' class=" tile_layer' + (i + 1) + ' tile_layers" />';

            }
        }

        let effclass = "";
        if (i['walkover'] == undefined || i['walkover'] != true) {
            effclass += " non_walkover ";
        }
        if (i['moveleft'] != undefined && i['moveleft'] != true) {
            effclass += " non_moveleft ";
        }
        if (i['moveright'] != undefined && i['moveright'] != true) {
            effclass += " non_moveright ";
        }
        if (i['moveup'] != undefined && i['moveup'] != true) {
            effclass += " non_moveup ";
        }
        if (i['movedown'] != undefined && i['movedown'] != true) {
            effclass += " non_movedown ";
        }

        html += '<div class="tile_layers tile_layer99 ' + effclass + '" >' + k + '</div>';
        cache[k] = html;
    }

    for (let k in data.item) {
        const i = data.item[k];
        document.querySelectorAll('.tile.' + k).forEach(e => {
            e.innerHTML = '';
            if (cache[k] != undefined) {
                e.innerHTML = cache[k];
            }
        });
    }
}

function refresh_tile(target) {
    const tile_id = target.getAttribute('tile_id');
    target.innerHTML = '';
    if (cache[tile_id] != undefined) {
        target.innerHTML = cache[tile_id];
    }

}

function additem(code, item) {
    let { layers = null } = item;

    let div = document.createElement('DIV');
    div.className = 'item';
    let html = '<div class="item_tile"><div class="tile ' + code + '"></div></div>';
    html += '<div class="item_title">' + code + '</div>';
    html += '<div class="item_info">';
    for (let k in options) {
        if (item[k] != undefined) {
            html += '<div class="item_info_options"><b>' + k + ':</b> ' + (item[k] ? 1 : 0) + '</div>';
        }
    }


    html += '</div>';
    html += '<div class="item_btn">';
    html += '<button onclick="edititem(\'' + code + '\')">Edit</button>';
    html += ' - <button onclick="setitem(\'' + code + '\')">Set</button>';
    html += '</div>';
    div.innerHTML = html;
    return div;
}

function exportFile() {
    var saveData = (function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        return function (data, fileName) {
            var //json = JSON.stringify(data),
                blob = new Blob([data], { type: "octet/stream" }),
                url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
        };
    }());

    let script = "";
    script += ' const map = ' + JSON.stringify(data.map).replace(/\},/g, "},\n").replace(/\],/g, "],\n") + ';' + "\n";
    script += ' const item = ' + JSON.stringify(data.item).replace(/\},/g, "},\n").replace(/\],/g, "],\n") + ';' + "\n";
    script += ' export default {  "map": map,  "item": item }; ';


    saveData(script, "export.js");

}
function importFile() {
    let files = document.querySelector('input.load').files;
    var reader = new FileReader();
    reader.onload = (function (theFile) {

        let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
        if ((encoded.length % 4) > 0) {
            encoded += '='.repeat(4 - (encoded.length % 4));
        }

        let scripts = atob(encoded).replace(/export default/g, 'window.data = ');
        data = eval(scripts);

        loadMap();
    });
    if (files.length > 0) {
        reader.readAsDataURL(files[0]);
    }

}


preload_img();



let actions = {
    hiddenlines, showlines, insertMapRow, insertMapCol, addMapRow, addMapCol, copyMapRow, copyMapCol,
    removeMapRow, removeMapCol, preload_img, createitem, edititem, saveitem, addlayer, removelayer,
    load_layers, load_options, setitem, loadMap, select_tile, load_map, genItemList, load_tile,
    refresh_tile, additem, exportFile, importFile
};

for (let actname in actions) {
    window[actname] = actions[actname];
}



const root = document.querySelector('#root');
ReactDOM.render(<MainView />, root);

window.onload = function () {
    loadMap();
};
