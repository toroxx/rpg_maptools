import React, { useState, useEffect } from "react";
import * as File from '../Lib/File';
import * as Util from '../Lib/Util';
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
                { label: 'New Map', accelerator: 'CmdOrCtrl+N', click: menu_callback },
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
                { label: 'Version: ' + pjson.version },
                { type: 'separator' },
                {
                    label: 'Reload', click: () => {
                        getCurrentWindow().reload();
                    }
                },
                {
                    label: 'DevTool', click: () => {
                        getCurrentWindow().openDevTools();
                    }
                }
            ]
        }
    ];
}




const MainView = (props) => {
    const { elements } = props;
    const DEFAULT_MAP = [['-void-', '-void-'], ['-void-', '-void-']];
    const DEFAULT_ITEM = { "-void-": { layers: null } };
    const DEFAULT_FILENAME = 'map.json';
    const [openfilename, setFilename] = useState(DEFAULT_FILENAME);

    const [mapdata, setMapData] = useState(DEFAULT_MAP);
    const [tiledata, setTileData] = useState(DEFAULT_ITEM);
    const [selectedItem, setSelectedItem] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [selectedTiles, setSelectedTiles] = useState([]);

    let menu_tmpl;

    const setMap = (map) => {
        setMapData([...map]);
    }
    const setTiles = (tiles) => {
        setTileData({ ...tiles });
    }

    useEffect(() => {
        menu_tmpl = menu_template(menu_callback);
        Menu.setApplicationMenu(Menu.buildFromTemplate(menu_tmpl));
    }, []);

    useEffect(() => {
        getCurrentWindow().setTitle('MapTools v' + pjson.version + ' Filename: ' + openfilename);
    }, [openfilename]);

    useEffect(() => {
        window.save_data = { map: mapdata, item: tiledata };
    }, [mapdata, tiledata]);


    const menu_callback = (e) => {
        switch (e.label) {
            case 'New Map':
                setFilename(DEFAULT_FILENAME);
                setMap(DEFAULT_MAP);
                setTiles(DEFAULT_ITEM);
                setEditItem(null);
                break;
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
                let filename = File.save(openfilename, script);
                if (filename) {
                    setFilename(filename);
                }
                break;
            case 'Show Guides':
                setGuidesVisible(e.checked);
                break;

        }
    }

    const setGuidesVisible = ($yes) => {

        let root = document.documentElement;
        root.style.setProperty('--guide-red', $yes ? "rgba(255, 0, 0, 0.8)" : 'transparent');
        root.style.setProperty('--guide-blue', $yes ? "#0000ff" : 'transparent');

        document.querySelectorAll('.tile_layer_top').forEach(p => {
            p.style.color = $yes ? ((p.innerHTML == '-void-') ? "#fff" : "#000") : 'transparent';

        });
    }


    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Elements.ItemForm  {...{ ...props, elements, tiledata, setTiles, editItem, setEditItem }} />
            <div className="editor">
                <Elements.ItemPanel {...{
                    ...props, elements, tiledata, setTiles, selectedTiles, selectedItem, setSelectedItem, editItem, setEditItem
                }} />
                <Elements.MapPanel {...{ ...props, elements, tiledata, mapdata, setMap, selectedTiles, setSelectedTiles, selectedItem, editItem, setEditItem }} />
            </div>
        </div>
    );
}

export default MainView;