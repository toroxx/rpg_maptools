import React, { useState, useEffect } from "react";
const { app: ele_app, BrowserWindow, ipcRenderer } = electron.remote;
const rootpath = ele_app.getAppPath();

const assets_path = window.env.ASSETS_PATH || '';


export function closest(el, sel) {
    if (el != null)
        return el.matches(sel) ? el
            : (el.querySelector(sel)
                || closest(el.parentNode, sel));
}

export function clipboard_read() {
    try {
        return JSON.parse(clipboardy.readSync());
    } catch (e) { }
    return null;
}
export function clipboard_write(data) {
    return clipboardy.writeSync(JSON.stringify(data));
}


export function preload_img(filepath, callback) {
    const img = document.createElement('img');
    document.body.appendChild(img);

    img.src = filepath;
    img.style.display = 'none';
    img.onload = function () {
        if (typeof (callback) == 'function') {
            callback(img);
        }
    }
};

export function tileOptionClasses(effclass, option) {
    let i = option;
    if (i['walkover'] === void (0) || i['walkover'] != true) {
        effclass.push("non_walkover");
    }
    if (i['moveleft'] == false) {
        effclass.push("non_moveleft");
    }
    if (i['moveright'] == false) {
        effclass.push("non_moveright");
    }
    if (i['moveup'] == false) {
        effclass.push("non_moveup");
    }
    if (i['movedown'] == false) {
        effclass.push("non_movedown");
    }
    if (i['eventdown'] == true) {
        effclass.push("eventdown");
    }
    if (i['eventleft'] == true) {
        effclass.push("eventleft");
    }
    if (i['eventup'] == true) {
        effclass.push("eventup");
    }
    if (i['eventright'] == true) {
        effclass.push("eventright");
    }
    if (i['autostart_ani'] == true) {
        effclass.push("autostart_ani");
    }
    return effclass;
}


export function makeTileCache(elements, tiledata) {
    let cache = {};
    for (let k in tiledata) {
        cache[k] = makeTileLayers(elements, k, tiledata[k]);
    }
    return cache;
}

export function makeTileLayers(elements, k, i) {
    let html = [];
    let layers_text = "";
    if (i['layers'] != null) {
        let layers = i['layers'];
        for (let i = 0; i < 5; i++) {
            if (layers[i] == void (0)) {
                continue;
            }
            let { bg = null, id = null, zIndex = 1, name = "", ani = "" } = layers[i];
            if (bg == null || id == null) {
                continue;
            }

            layers_text += "\nzIndex: " + zIndex + ", " + bg + " (" + id + "), name:" + name + ", ani:" + ani;

            let layer_type = ani != "" ? 'layer' : 'ani';
            html.push([layer_type, (tile_display_size) => {
                const { path, row_per_tile, tile_size, width, height, getXYByID, getScale } = elements[bg];
                const { x, y } = getXYByID(id);
                const scale = getScale(tile_display_size);

                return <img data-name={name} data-ani={ani} key={'tile_layer' + (i + 1)} src={path}
                    style={{
                        width: (width * scale) + "px",
                        position: 'absolute',
                        left: '-' + (x * tile_display_size) + 'px',
                        top: '-' + (y * tile_display_size) + 'px',
                        zIndex: zIndex
                    }}
                    className={['tile_layer' + (i + 1), 'tile_layers', 'z' + zIndex, name, "t" + layer_type].join(' ')} />
            }]);
        }
    }

    let effclass = tileOptionClasses([], i)
    html.push(['top', () => {
        return <div key={'tile_layer_top'} title={`${k}\n${effclass}${layers_text}`} className={[...effclass, "tile_layers", "tile_layer_top"].join(' ')} >
            <div>{k}</div>
        </div>
    }]);
    return html;
}


export function load_asset_resources(folder) {
    const files = fs.readdirSync(path.join(assets_path, '/' + folder + '/'));
    let resources = {};

    for (let filename of files) {
        let [name = "", size, ext] = filename.split(/[@.]+/);
        let [row_per_tile = 0, tile_size = 0] = size.split('x');

        row_per_tile = parseInt(row_per_tile);
        tile_size = parseInt(tile_size);

        if (filename != '' && row_per_tile > 0 && tile_size > 0) {
            const img_path = path.join(assets_path, '/' + folder + '/', filename);
            let { width, height } = sizeOf(img_path);

            resources[name] = {
                "path": img_path, filename, row_per_tile, tile_size, width, height,
                wCount: Math.ceil(width / tile_size),
                hCount: Math.ceil(height / tile_size),
                getXYByID: (id) => {
                    const row = Math.floor(id / row_per_tile);
                    const col = (id % row_per_tile);
                    return { y: row, x: col };
                },
                getScale: (tile_display_size) => {
                    return tile_display_size / tile_size;
                }
            }

        }
    }

    window.resources = resources;
    return resources;
}

export function getMenuItem(menu_template, menu, submenu) {
    for (let k in menu_template) {
        if (menu == menu_template[k].label) {
            let menu_item = menu_template[k];
            if (submenu == void (0)) {
                return menu_item;
            } else {
                for (let k2 in menu_item.submenu) {
                    if (submenu == menu_item.submenu[k2].label) {
                        return menu_item.submenu[k2];
                    }
                }
            }
        }
    }
    return null;
}
