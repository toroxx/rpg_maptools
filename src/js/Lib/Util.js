
const { app: ele_app, BrowserWindow, ipcRenderer } = electron.remote;
const rootpath = ele_app.getAppPath();

const assets_path = path.join(rootpath, '/assets/');

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
            resources[name] = {
                "path": img_path, filename, row_per_tile, tile_size
            }

            preload_img(img_path, (img) => {
                resources[name]['width'] = img.width;
                resources[name]['height'] = img.height;
            })
        }
    }


    return resources;
}

export function getMenuItem(menu_template, menu, submenu) {
    for (let k in menu_template) {
        if (menu == menu_template[k].label) {
            let menu_item = menu_template[k];
            if (submenu == void(0)) {
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
