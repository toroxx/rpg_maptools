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

    function tile_menu(e) {
        e.preventDefault();
        const node = e.target.parentNode.parentNode;
        const menu4tile = new Menu()
        menu4tile.append(new MenuItem({ label: 'Edit', click: () => { menu_callback('Edit', node) } }))
        menu4tile.append(new MenuItem({ label: 'Delete', click: () => { menu_callback('Delete', node) } }))
        menu4tile.popup({ window: remote.getCurrentWindow() })
    }

    const menu_callback = (action, target) => {
        //console.log(action, target);
        const tileid = target.getAttribute('data-tile_id');
        switch (action) {
            case 'Edit':
                setEditItem(tileid);
                break;
            case 'Delete':
                let tmp = {};
                for (let k in tiledata) {
                    if (k != tileid) {
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

                <Tile width={65} tile={tileCache[tile_id]} tile_id={tile_id}
                    onClick={(e) => {
                        if (e.target && e.target.parentNode && e.target.parentNode.parentNode) {
                            let select_tile = e.target.parentNode.parentNode;

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
            <div className="title_bar">
                <b>&nbsp; ITEMS </b>

                <a style={{ cursor: 'pointer' }} onClick={() => { setEditItem("") }}>&#10133;</a>
            </div>
            <div className="itemlist">
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