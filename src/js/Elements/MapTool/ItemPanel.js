import React, { useState, useEffect } from "react";
import Tile from './Tile';


const ItemPanel = (props) => {
    const { tiledata, tileCache, setTiles, selectedTiles, setSelectedItem, editItem, setEditItem } = props;

    function tile_menu(e) {
        e.preventDefault()
        const node = e.target.parentNode;
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
                        tmp.push(tiledata[k]);
                    }

                }
                setTiles(tmp);
                break;
        }
    }


    function tile_item(tileCache, tile_id, item) {
        return (
            <div key={tile_id} className="item_tile" >

                <Tile width={65} tile={tileCache[tile_id]} tile_id={tile_id}
                    onClick={(e) => {
                        if (e.target && e.target.parentNode) {
                            let select_tile = e.target.parentNode;

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

                <a  style={{cursor:'pointer'}} onClick={() => { setEditItem("") }}>&#10133;</a>
            </div>
            <div className="itemlist">
                {Object.keys(tiledata).map((k) => {
                    return tile_item(tileCache, k, tiledata[k]);
                })}
            </div>
        </div>
    );
}
export default ItemPanel;