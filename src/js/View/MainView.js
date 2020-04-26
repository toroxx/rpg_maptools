import React, { useState, useEffect } from "react";
import * as File from '../Lib/File';
import * as Util from '../Lib/Util';
import * as Elements from "../Elements";
const { getCurrentWindow, Menu } = electron.remote;

let resizebar_clicked = false;

let root = document.documentElement;

root.addEventListener("mousemove", e => {
    if (e.which == 1 && resizebar_clicked) {
        if (e.clientX > 200 && e.clientX < window.innerWidth * 0.8) {
            root.style.setProperty('--items-panel-width', e.clientX + "px");
        }

    }
});

const menu_template = (menu_callback, opened_files) => {

    let opened = [];
    let i = 1;
    for (let k in opened_files) {
        let { path } = opened_files[k];
        opened.push({ label: i + ". " + path, click: (e) => { menu_callback('OpenFile', e, path) } });
        i++;
    }
    if (opened.length == 0) {
        opened.push({ label: 'No Recent File', disabled: true });
    }

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
                { label: 'New Map', accelerator: 'CmdOrCtrl+N', click: (e) => { menu_callback('New Map', e) } },
                { label: 'Load Map', accelerator: 'CmdOrCtrl+L', click: (e) => { menu_callback('Load Map', e) } },
                { label: 'Save Map', accelerator: 'CmdOrCtrl+S', click: (e) => { menu_callback('Save Map', e) } },
                { type: 'separator' },

                ...opened,
                { type: 'separator' },
                isMac ? { role: 'close' } : { role: 'quit' }
            ]
        },
        {
            label: '&View',
            submenu: [
                //{ label: 'Show Lines', click: menu_callback },
                { label: 'Show Guides', type: "checkbox", checked: true, click: (e) => { menu_callback("Show Guides", e) } },
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
    const { elements, db } = props;
    const DEFAULT_MAP = [['-void-', '-void-'], ['-void-', '-void-']];
    const DEFAULT_ITEM = { "-void-": { layers: null } };
    const DEFAULT_MAPTILE_OPTION = {};

    const DEFAULT_FILENAME = 'map.json';
    const [openfilename, setFilename] = useState(DEFAULT_FILENAME);

    const [mapdata, setMapData] = useState(DEFAULT_MAP);
    const [mapTileOption, setMapTileOption] = useState(DEFAULT_MAPTILE_OPTION);
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
        db.find({}, (err, docs) => {
            menu_tmpl = menu_template(menu_callback, docs);
            Menu.setApplicationMenu(Menu.buildFromTemplate(menu_tmpl));
        })

    }, []);

    useEffect(() => {
        //menu_tmpl = menu_template(menu_callback, db);
        //Menu.setApplicationMenu(Menu.buildFromTemplate(menu_tmpl));
        getCurrentWindow().setTitle('MapTools v' + pjson.version + ' Filename: ' + openfilename);
    }, [openfilename]);

    useEffect(() => {
        window.save_data = { map: mapdata, item: tiledata, mapTileOption };
    }, [mapdata, tiledata, mapTileOption]);


    const menu_callback = (mode, e, params = {}) => {
        switch (mode) {
            case "OpenFile":
                console.log(params)
                break;
            case 'New Map':
                setFilename(DEFAULT_FILENAME);
                setMap(DEFAULT_MAP);
                setTiles(DEFAULT_ITEM);
                setEditItem(null);
                break;
            case 'Load Map':
                const result = File.load();
                if (result) {
                    const [filepath, filename, mapjson] = result;
                    const {
                        map = DEFAULT_MAP, item = DEFAULT_ITEM,
                        mapTileOption = DEFAULT_MAPTILE_OPTION } = JSON.parse(mapjson);
                    setFilename(filename);
                    setMap(map);
                    setTiles(item);
                    setMapTileOption({ ...mapTileOption })
                    setEditItem(null);
                    //db.save()
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
        root.style.setProperty('--tile-caption-color', $yes ? "#fff" : 'transparent');
        root.style.setProperty('--tile-caption-stroke-color', $yes ? "#000" : 'transparent');

    }


    return (
        <div style={{ width: '100%', height: '100%' }}>


            <div className="editor">
                <div className="menu_panel">
                    <Elements.ItemPanel {...{
                        ...props,
                        elements, tiledata, setTiles, selectedTiles, selectedItem, setSelectedItem, editItem, setEditItem
                    }} />

                    <Elements.TileInfoPanel {...{
                        ...props, mapTileOption, setMapTileOption,
                    }} />
                    <div className="resizebar" onMouseDown={(e) => { resizebar_clicked = true; }}
                        onMouseUp={(e) => { resizebar_clicked = false; }}>&nbsp;</div>
                </div>
                <Elements.MapPanel {...{
                    ...props,
                    mapTileOption, setMapTileOption,
                    elements, tiledata, mapdata, setMap, selectedTiles, setSelectedTiles, selectedItem, editItem, setEditItem
                }} />
            </div>


            <div className="forms" >
                <Elements.ItemForm  {...{
                    ...props,
                    elements, tiledata, setTiles, editItem, setEditItem
                }} />

            </div>
        </div>
    );
}

export default MainView;