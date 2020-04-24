import React, { useState, useEffect } from "react";
import * as File from '../Lib/File';
import * as Elements from "../Elements";
const { getCurrentWindow, Menu } = electron.remote;

const menu_template = (menu_callback) => {
    const isMac = process.platform === 'darwin';
    return [
        ...(isMac ? [{
            label: app.name,
            submenu: [
                { role: 'quit' }
            ]
        }] : []),
        {
            label: '&Files',
            submenu: [
                { label: 'Load Map', accelerator: 'CmdOrCtrl+L', click: menu_callback },
                { label: 'Save Map', accelerator: 'CmdOrCtrl+S', click: menu_callback },
                { type: 'separator' },
                isMac ? { role: 'close' } : { role: 'quit' }
            ]
        },
        {
            label: '&View',
            submenu: [
                //{ label: 'Show Lines', click: menu_callback },
                { label: 'Show Guides', type: "checkbox", checked: true, click: menu_callback },
            ],
        },
        {
            label: '&Help',
            submenu: [
                { label: 'Version: ' + pjson.version }
            ]
        }
    ];
}




const MainView = (props) => {
    const { elements } = props;
    const DEFAULT_MAP = [['-void-', '-void-'], ['-void-', '-void-']];
    const DEFAULT_ITEM = { "-void-": { layers: null } };

    const [openfilename, setFilename] = useState('map.json');

    const [mapdata, setMapData] = useState(DEFAULT_MAP);
    const [tiledata, setTileData] = useState(DEFAULT_ITEM);
    const [tileCache, setTileCache] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [selectedTiles, setSelectedTiles] = useState([]);

    let menu_tmpl;

    const setMap = (map) => {
        setMapData([...map]);
    }
    const setTiles = (tiles) => {
        setTileData({ ...tiles });
        setTileCache(makeTileCache(tiles));
    }

    useEffect(() => {
        menu_tmpl = menu_template(menu_callback);
        Menu.setApplicationMenu(Menu.buildFromTemplate(menu_tmpl));
    }, []);

    useEffect(() => {
        getCurrentWindow().setTitle('MapTools v' + pjson.version + ' Filename: ' + openfilename);
    }, [openfilename]);

    useEffect(() => {
        setTileCache(makeTileCache(tiledata));
        window.save_data = { map: mapdata, item: tiledata };
    }, [mapdata, tiledata]);


    const makeTileCache = (tiledata) => {
        let cache = {};
        for (let k in tiledata) {
            const i = tiledata[k];
            let html = [];

            if (i['layers'] != null) {
                let layers = i['layers'];
                for (let i = 0; i < 5; i++) {
                    if (layers[i] == void (0)) {
                        continue;
                    }
                    let { bg = null, id = null, zIndex = 1 } = layers[i];
                    if (bg == null || id == null) {
                        continue;
                    }

                    html.push(['layer', (tile_display_size) => {
                        const { path, row_per_tile, tile_size, width, height } = elements[bg];
                        const row = Math.floor(id / row_per_tile) * tile_display_size;
                        const col = (id % row_per_tile) * tile_display_size;
                        const scale = tile_display_size / tile_size;

                        return <img key={'tile_layer' + (i + 1)} src={path}
                            style={{ width: (width * scale) + "px", left: '-' + col + 'px', top: '-' + row + 'px', zIndex: zIndex }}
                            className={'tile_layer' + (i + 1) + ' tile_layers'} />
                    }]);
                }
            }

            let effclass = [];

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

            html.push(['top', () => {

                return <div style={{
                    fontWeight: 'bold', 'fontSize': '8px', 'color': k == '-void-' ? '#fff' : '#000'
                }}
                    key={'tile_layer_top'} title={`${k}\n${effclass}`} className={[...effclass, "tile_layers", "tile_layer_top"].join(' ')} >
                    {k}
                </div>
            }]);
            cache[k] = html;
        }
        return cache;
    }

    const menu_callback = (e) => {
        switch (e.label) {
            case 'Load Map':
                const result = File.load();
                if (result) {
                    const [filename, mapjson] = result;
                    const { map = DEFAULT_MAP, item = DEFAULT_ITEM } = JSON.parse(mapjson);
                    setFilename(filename);
                    setMap(map);
                    setTiles(item);
                    setEditItem(null);
                }
                break;
            case 'Save Map':
                let script = JSON.stringify(window.save_data).replace(/\],/g, "],\n");
                File.save(openfilename, script);
                break;
            case 'Show Guides':
                setGuidesVisible(e.checked);
                break;

        }
    }

    const setGuidesVisible = ($yes) => {
        let styles = ['non_walkover', 'non_moveleft', 'non_moveright', 'non_moveup', 'non_movedown'];
        styles.forEach(e => {
            document.querySelectorAll('.' + e).forEach(p => {
                p.style.borderWidth = $yes ? "3px" : '0px';
            });
        });
    }


    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Elements.ItemForm  {...{ ...props, elements, tileCache, tiledata, setTiles, editItem, setEditItem }} />
            <div className="editor">
                <Elements.ItemPanel {...{
                    ...props, tileCache, tiledata, setTiles, selectedTiles,
                    selectedItem, setSelectedItem,
                    editItem, setEditItem
                }} />
                <Elements.MapPanel {...{ ...props, tileCache, mapdata, setMap, selectedTiles, setSelectedTiles, selectedItem }} />
            </div>
        </div>
    );
}

export default MainView;