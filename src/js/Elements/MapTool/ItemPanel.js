import React, { useState, useEffect } from "react";
import * as Util from '../../Lib/Util';
import Tile from './Tile';

let resizebar_clicked = false;

let root = document.documentElement;

root.addEventListener("mousemove", e => {
    if (e.which == 1 && resizebar_clicked) {
        if (e.clientX > 200 && e.clientX < window.innerWidth * 0.8) {
            root.style.setProperty('--items-panel-width', e.clientX + "px");
        }

    }
});

const ItemPanel = (props) => {
    const { elements, tiledata, setTiles, selectedTiles, setSelectedItem, editItem, setEditItem } = props;
    const tileCache = Util.makeTileCache(elements, tiledata);

    function panel_menu(e) {
        e.preventDefault();
        console.log(e.target)
        console.log('panel_menu')
        let clipboard_json = Util.clipboard_read();
        let clipboard = null;
        try {
            clipboard = JSON.parse(clipboard_json);

        } catch (e) {

        }
        if (clipboard != null && clipboard['type'] == "tiledata") {
            if (clipboard.name == null || clipboard.value == null) {
                return;
            }

            const menu4tile = new Menu()
            menu4tile.append(new MenuItem({ label: 'Import', click: () => { menu_callback('Import', e, clipboard) } }))
            menu4tile.popup({ window: remote.getCurrentWindow() })
        }
    }
    function tile_menu(elem) {
        console.log(elem)
        console.log('tile_menu')
        const node = elem;
        const tileid = node.getAttribute('data-tile_id');
        const menu4tile = new Menu()
        menu4tile.append(new MenuItem({ label: 'Edit', click: () => { menu_callback('Edit', node, tileid) } }))
        menu4tile.append(new MenuItem({ label: 'Delete', click: () => { menu_callback('Delete', node, tileid) } }))
        menu4tile.append(new MenuItem({ type: 'separator' }))
        menu4tile.append(new MenuItem({ label: 'Copy JSON', click: () => { menu_callback('Copy', node, tileid) } }))
        menu4tile.popup({ window: remote.getCurrentWindow() })
    }

    const menu_callback = (action, target, params = {}) => {

        let tmp;
        //console.log(action, target);

        switch (action) {
            case 'Import':
                tmp = tiledata;
                let { name = "", value } = params;
                dialogs.prompt('Name of New Tile', name, ok => {
                    if (ok && ok != "") {
                        tmp[ok] = value;
                        setTiles({ ...tmp });
                    }
                });
                break;
            case 'Edit':
                setEditItem(params);
                break;
            case 'Copy':
                Util.clipboard_write(JSON.stringify({ 'type': 'tiledata', name: params, value: tiledata[params] }));
                break;
            case 'Delete':
                tmp = {};
                for (let k in tiledata) {
                    if (k != params) {
                        tmp[k] = tiledata[k];
                    }
                }
                setTiles({ ...tmp });
                break;
        }
    }


    function tile_item(tile_id, item) {
        return (
            <div key={tile_id} className="item_tile" >

                <Tile width={65} tileCache={tileCache} tiledata={tile_id}
                    onClick={(elem) => {
                        let select_tile = elem;

                        if (select_tile.classList.contains('selected')) {
                            select_tile.classList.remove('selected');
                            setSelectedItem(null);
                        } else {
                            document.querySelector('.items_panel').querySelectorAll('.tile').forEach(element => {
                                element.classList.remove('selected');
                            });
                            select_tile.classList.add('selected');
                            setSelectedItem(select_tile.getAttribute("data-tile_id"));
                        }
                    }}
                    onContextMenu={(e) => {
                        if (tile_id != '-void-') {
                            tile_menu(e);
                        }
                    }} />
            </div>
        );

    }


    return (
        <div className="items_panel">
            <div className="title_bar" onContextMenu={(e) => {
                panel_menu(e);
            }}>
                <b>&nbsp; ITEMS </b>

                <a style={{ cursor: 'pointer' }} onClick={() => { setEditItem("") }}>&#10133;</a>
            </div>
            <div className="itemlist" >
                {Object.keys(tiledata).map((k) => {
                    return tile_item(k, tiledata[k]);
                })}
            </div>

            <div className="resizebar" onMouseDown={(e) => { resizebar_clicked = true; }}
                onMouseUp={(e) => { resizebar_clicked = false; }}>&nbsp;</div>
        </div>
    );
}
export default ItemPanel;