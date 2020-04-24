import React, { useState, useEffect } from "react";
import Tile from './Tile';

let copied_object = null;
let ctrl_pressed = false;

const MapPanel = (props) => {

    const { tileCache, mapdata, setMap, selectedTiles, setSelectedTiles, selectedItem } = props;

    useEffect(() => {
        window.addEventListener("keyup", (e) => {
            ctrl_pressed = false;
        })
        window.addEventListener("keydown", (e) => {
            if (e.which == 17) {
                ctrl_pressed = true;
            }
        })
    }, []);

    useEffect(() => {
        document.querySelector('.tiles').querySelectorAll('.tile.selected').forEach(e => {
            e.classList.remove('selected');
        });
        selectedTiles.forEach(v => {
            let [ele, x, y] = v;
            ele.classList.add('selected');
        })
    }, [selectedTiles]);

    function select_tile(target, x, y, append) {
        let item = [target, x, y]
        let tmp = (ctrl_pressed || append == true) ? [...selectedTiles, item] : [item];
        setSelectedTiles(tmp);
    }

    function getTile(x, y) {
        return (mapdata && mapdata[y] && mapdata[y][x]) || false;
    }
    function setTile(x, y, tile) {
        mapdata[y][x] = tile;
        setMap(mapdata);
    }

    const menu_callback = (action, target) => {
        //console.log(action, target);
        const tilename = target.getAttribute('data-tilename');
        const x = target.getAttribute('data-x');
        const y = target.getAttribute('data-y');

        let col_items = mapdata[0].length;

        let empty_row = [];
        for (let i = 0; i < col_items; i++) { empty_row.push('-void-'); }

        let tmpMap = [];
        switch (action) {
            case 'Insert Row':
                mapdata.forEach((v, py) => {
                    if (py == y) {
                        tmpMap.push(empty_row);
                    }
                    tmpMap.push(v);
                })
                setMap(tmpMap);
                break;
            case 'Append Row':
                mapdata.forEach((v, py) => {
                    tmpMap.push(v);
                    if (py == y) {
                        tmpMap.push(empty_row);
                    }
                })
                setMap(tmpMap);
                break;
            case 'Delete Row':
                mapdata.forEach((v, py) => {
                    if (py != y) { tmpMap.push(v); }
                })
                setMap(tmpMap);
                break;
            case 'Copy Row':
                copied_object = { type: 'row', name: tilename, value: y };
                break;
            case 'Paste Row':
                if (copied_object != null) {
                    const { type = null, value } = copied_object;
                    if (type == "row") {
                        mapdata.forEach((v, py) => {
                            tmpMap.push((py == y) ? mapdata[value] : v);
                        })
                        setMap(tmpMap);
                    }
                }
                break;
            case 'Insert Col':
                mapdata.forEach((cols, py) => {
                    let tmp = [];
                    cols.forEach((col, px) => {
                        if (px == x) {
                            tmp.push('-void-');
                        }
                        tmp.push(col);
                    })
                    tmpMap.push(tmp);
                });
                setMap(tmpMap);
                break;
            case 'Append Col':
                mapdata.forEach((cols, py) => {
                    let tmp = [];
                    cols.forEach((col, px) => {
                        tmp.push(col);
                        if (px == x) {
                            tmp.push('-void-');
                        }
                    })
                    tmpMap.push(tmp);
                });
                setMap(tmpMap);
                break;
            case 'Delete Col':
                mapdata.forEach((cols, py) => {
                    let tmp = [];
                    cols.forEach((col, px) => {
                        if (px != x) {
                            tmp.push(col);
                        }
                    })
                    tmpMap.push(tmp);
                });
                setMap(tmpMap);
                break;
            case 'Copy Col':
                copied_object = { type: 'col', name: tilename, value: x };
                break;
            case 'Paste Col':
                if (copied_object != null) {
                    const { type = null, value } = copied_object;
                    if (type == "col") {
                        mapdata.forEach((cols, py) => {
                            let tmp = [];
                            cols.forEach((col, px) => {
                                tmp.push((px == x) ? cols[value] : col);
                            })
                            tmpMap.push(tmp);
                        });
                        setMap(tmpMap);
                    }
                }
                break;
            case 'Copy Tile':
                copied_object = { type: 'tile', name: tilename, value: target.getAttribute('data-tile_id') };
                break;
            case 'Paste Tile':
                if (copied_object != null) {
                    const { type = null, value } = copied_object;
                    if (type == "tile") {
                        setTile(x, y, value);
                    }
                }
                break;
        }
    }



    function header_top_menu(e) {
        e.preventDefault()
        const node = e.target;
        let tilename = node.getAttribute('data-tilename');

        const menu4top = new Menu()
        menu4top.append(new MenuItem({ label: tilename, enabled: false }))
        menu4top.append(new MenuItem({ type: 'separator' }))
        menu4top.append(new MenuItem({ label: 'Insert Col', click: () => { menu_callback('Insert Col', node) } }))
        menu4top.append(new MenuItem({ label: 'Append Col', click: () => { menu_callback('Append Col', node) } }))
        menu4top.append(new MenuItem({ label: 'Delete Col', click: () => { menu_callback('Delete Col', node) } }))
        menu4top.append(new MenuItem({ type: 'separator' }))
        menu4top.append(new MenuItem({ label: 'Copy Col', click: () => { menu_callback('Copy Col', node) } }))

        if (copied_object != null) {
            const { type = null, name } = copied_object;
            if (type == "col") {
                menu4top.append(new MenuItem({ label: 'Paste Col (' + name + ')', click: () => { menu_callback('Paste Col', node) } }))
            }
        }
        menu4top.popup({ window: remote.getCurrentWindow() })
    }

    function header_left_menu(e) {
        e.preventDefault()
        const node = e.target;
        let tilename = node.getAttribute('data-tilename');

        const menu4left = new Menu()
        menu4left.append(new MenuItem({ label: tilename, enabled: false }))
        menu4left.append(new MenuItem({ type: 'separator' }))
        menu4left.append(new MenuItem({ label: 'Insert Row', click: () => { menu_callback('Insert Row', node) } }))
        menu4left.append(new MenuItem({ label: 'Append Row', click: () => { menu_callback('Append Row', node) } }))
        menu4left.append(new MenuItem({ label: 'Delete Row', click: () => { menu_callback('Delete Row', node) } }))
        menu4left.append(new MenuItem({ type: 'separator' }))
        menu4left.append(new MenuItem({ label: 'Copy Row', click: () => { menu_callback('Copy Row', node) } }))
        if (copied_object != null) {
            const { type = null, name } = copied_object;
            if (type == "row") {
                menu4left.append(new MenuItem({ label: 'Paste row (' + name + ')', click: () => { menu_callback('Paste Row', node) } }))
            }
        }
        menu4left.popup({ window: remote.getCurrentWindow() })
    }


    function tile_menu(e) {
        e.preventDefault()

        const node = e.target.parentNode;
        let tilename = node.getAttribute('data-tilename');
        const menu4tile = new Menu()
        menu4tile.append(new MenuItem({ label: tilename, enabled: false }))
        menu4tile.append(new MenuItem({ type: 'separator' }))
        menu4tile.append(new MenuItem({ label: 'Copy Tile', click: () => { menu_callback('Copy Tile', node) } }))

        if (copied_object != null) {
            const { type = null, name } = copied_object;
            if (type == "tile") {
                menu4tile.append(new MenuItem({ label: 'Paste Tile (' + name + ')', click: () => { menu_callback('Paste Tile', node) } }))
            }
        }
        menu4tile.popup({ window: remote.getCurrentWindow() })
    }

    return (

        <div className="map_panel">

            <div className="title_bar">
                <div style={{ float: 'left' }}>
                    <b>&nbsp; MAP</b>
                </div>
            </div>

            <div className="tiles">
                <div key={`row_header`} className="row">
                    <div className="col tile_corner">&nbsp;</div>
                    {mapdata[0].map((tile_id, x) => {
                        return (<div key={`header_col_${x}`} data-tilename={'col-' + x} data-x={x}
                            className="col tile_head_top"
                            onClick={(e) => {
                                let tmp = [];
                                document.querySelectorAll('.col_' + x).forEach((v) => {
                                    let dy = v.getAttribute('data-y') || 0;
                                    tmp.push([v, x, dy]);
                                });
                                setSelectedTiles(tmp);
                            }}
                            onContextMenu={(e) => header_top_menu(e)}>{x}</div>);
                    })}
                </div>

                {mapdata.map((col, y) => (<div key={`row_${y}`} className="row">
                    <div key={`header_row_${y}`} data-y={y} data-tilename={'row-' + y} className="col tile_head_left"
                        onClick={(e) => {
                            let tmp = [];
                            document.querySelectorAll('.row_' + y).forEach((v) => {
                                let dx = v.getAttribute('data-x') || 0;
                                tmp.push([v, dx, y]);
                            });
                            setSelectedTiles(tmp);
                        }}
                        onContextMenu={(e) => header_left_menu(e)}>{y}</div>

                    {col.map((tile_id, x) => {
                        return (<Tile key={`tile_${x}_${y}`} tile_id={tile_id} tile={tileCache[tile_id]} x={x} y={y}
                            onClick={(e) => {
                                if (e.target && e.target.parentNode) {
                                    select_tile(e.target.parentNode, x, y);
                                }

                                if (selectedItem != null) {
                                    setTile(x, y, selectedItem);
                                }
                            }}
                            onContextMenu={(e) => tile_menu(e)}
                        />);
                    })}
                </div>))}
            </div>
        </div>
    );

}
export default MapPanel;