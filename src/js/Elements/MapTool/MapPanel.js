import React, { useState, useEffect } from "react";
import * as Util from '../../Lib/Util';
import Tile from './Tile';

let copied_object = null;
let ctrl_pressed = false;
let ani_clock = {};
let ani_txtclock = {};

const MapPanel = (props) => {
    const { elements, tiledata, mapdata, setMap, selectedTiles, setSelectedTiles, selectedItem, editItem, setEditItem } = props;

    const tileCache = Util.makeTileCache(elements, tiledata);
    const [leveldisplays, setLeveldisplays] = useState({});

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
        console.log('ani_clock:', ani_clock);
        for (let k in ani_clock) {
            clearInterval(ani_clock[k]);

        }
        ani_clock = {};
        ani_txtclock = {};
        console.log('Clocks clear');

        let tile_ani_layer = {};
        for (let v in tiledata) {

            let { autostart_ani, layers } = tiledata[v];
            if (autostart_ani == false || autostart_ani == void (0)) {
                continue;
            }

            let anilayers = {};
            for (let layer_index in layers) {
                let { name = "", ani = "" } = layers[layer_index];
                if (name == "" || ani == "") {
                    continue;
                }
                anilayers[ani] = layers[layer_index];
            }



            if (Object.keys(anilayers).length > 1) {
                const ordered = {};
                Object.keys(anilayers).sort((a, b) => a.ani - b.ani).forEach(function (key) {
                    ordered[key] = anilayers[key];
                });
                tile_ani_layer[v] = { layers: ordered, current: 1, total: Object.keys(anilayers).length };
            }
        }

        let i = -1;
        for (let v in tile_ani_layer) {
            i++;
            console.log('Clock: ' + v, ' start');
            if (ani_txtclock[v] == void (0)) {
                ani_txtclock[v] = 0;
            }

            let c = setInterval(() => {
                ani_callback(tile_ani_layer[v], v, ani_txtclock[v]);
                ani_txtclock[v] = (ani_txtclock[v] + 1) % 10;
            }, 100);

            ani_clock[v] = c;


        }
        console.log("ani_clock: ", ani_clock);
    }, [tiledata])


    function ani_callback(tile_ani_layer, v, txtClock) {
        let { layers, current, total } = tile_ani_layer;
        let anis = {};
        let closest = 0;
        for (let k in layers) {
            let { name, ani } = layers[k];
            ani = parseInt(ani);
            anis[ani] = name;

            if (txtClock > ani) {
                closest = ani;
            }

        }
        for (let ani in anis) {
            document.querySelector('.tiles').querySelectorAll('.tile.' + v + ' .' + anis[ani]).forEach(e => {
                e.style.display = ani == closest ? 'block' : 'none';
            });
        }

    }


    useEffect(() => {
        document.querySelector('.tiles').querySelectorAll('.tile.selected').forEach(e => {
            e.classList.remove('selected');
        });
        selectedTiles.forEach(v => {
            let [ele, x, y] = v;
            ele.classList.add('selected');
        })
    }, [selectedTiles]);

    useEffect(() => {
        for (let k in leveldisplays) {
            document.querySelector('.tiles').querySelectorAll('.tile').forEach(e => {
                e.querySelectorAll('.z' + k).forEach(e2 => {
                    e2.style.display = leveldisplays[k] ? 'block' : 'none';
                });
            });

        }
    }, [leveldisplays])

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
                dialogs.prompt('Insert Row', 1, ok => {
                    if (ok) {
                        let count = parseInt(ok);
                        mapdata.forEach((v, py) => {
                            if (py == y) {
                                for (let i = 0; i < count; i++) {
                                    tmpMap.push(empty_row);
                                }
                            }
                            tmpMap.push(v);
                        })
                        setMap(tmpMap);

                    }
                });

                break;
            case 'Append Row':
                dialogs.prompt('Append Row', 1, ok => {
                    if (ok) {
                        let count = parseInt(ok);
                        mapdata.forEach((v, py) => {
                            tmpMap.push(v);
                            if (py == y) {
                                for (let i = 0; i < count; i++) {
                                    tmpMap.push(empty_row);
                                }
                            }
                        })
                        setMap(tmpMap);
                    }
                });
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
                dialogs.prompt('Append Col', 1, ok => {
                    if (ok) {
                        let count = parseInt(ok);

                        mapdata.forEach((cols, py) => {
                            let tmp = [];
                            cols.forEach((col, px) => {
                                if (px == x) {
                                    for (let i = 0; i < count; i++) {
                                        tmp.push('-void-');
                                    }
                                }
                                tmp.push(col);
                            })
                            tmpMap.push(tmp);
                        });
                        setMap(tmpMap);
                    }
                });
                break;
            case 'Append Col':
                dialogs.prompt('Append Col', 1, ok => {
                    if (ok) {
                        let count = parseInt(ok);

                        mapdata.forEach((cols, py) => {
                            let tmp = [];
                            cols.forEach((col, px) => {
                                tmp.push(col);
                                if (px == x) {
                                    for (let i = 0; i < count; i++) {
                                        tmp.push('-void-');
                                    }
                                }
                            })
                            tmpMap.push(tmp);
                        });
                        setMap(tmpMap);
                    }
                });
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

        const node = e.target.parentNode.parentNode;
        let tilename = node.getAttribute('data-tilename');
        let tileid = node.getAttribute('data-tile_id');
        const menu4tile = new Menu()
        menu4tile.append(new MenuItem({ label: tilename, enabled: false }))
        menu4tile.append(new MenuItem({ type: 'separator' }))
        menu4tile.append(new MenuItem({ label: 'Copy Tile', click: () => { menu_callback('Copy Tile', node) } }))

        if (tileid != "" && tileid != "-void-") {

            menu4tile.append(new MenuItem({ label: 'Edit Tile', click: () => { setEditItem(tileid) } }))
        }

        if (copied_object != null) {
            const { type = null, name } = copied_object;
            if (type == "tile") {
                menu4tile.append(new MenuItem({ label: 'Paste Tile (' + name + ')', click: () => { menu_callback('Paste Tile', node) } }))
            }
        }
        menu4tile.popup({ window: remote.getCurrentWindow() })
    }

    function level_control() {
        let levels = {};
        for (let y in mapdata) {
            for (let x in mapdata[y]) {
                const tile_id = mapdata[y][x];
                const { layers = [] } = tiledata[tile_id] || {};
                if (layers != null) {
                    layers.forEach(({ zIndex = 1 }) => {
                        if (levels[zIndex] == void (0)) {
                            levels[zIndex] = 0;
                        }
                        levels[zIndex]++;
                    });
                }
            }
        }

        let html = [];
        for (let y in levels) {
            if (leveldisplays[y] == void (0)) {
                leveldisplays[y] = 1;
                setLeveldisplays({ ...leveldisplays });
            }
            html.push(<span key={html.length}>
                {y} ({levels[y]}) <input type="checkbox" checked={leveldisplays[y] == 1 ? 'chekced' : null} onChange={(e) => {
                    leveldisplays[y] = e.target.checked;
                    setLeveldisplays({ ...leveldisplays });
                }} /> &nbsp;| &nbsp;
            </span>);
        }
        return html;
    }


    function makeTile(tile_id, x, y) {
        return (<Tile key={`tile_${x}_${y}`} tile_id={tile_id} tile={tileCache[tile_id]} x={x} y={y}
            onClick={(e) => {
                if (e.target && e.target.parentNode && e.target.parentNode.parentNode) {
                    select_tile(e.target.parentNode.parentNode, x, y);
                }

                if (selectedItem != null) {
                    setTile(x, y, selectedItem);
                }
            }}
            onContextMenu={(e) => tile_menu(e)}
        />);
    }
    return (

        <div className="map_panel">
            <div className="title_bar">
                <div style={{ float: 'left' }}>
                    <b>&nbsp; MAP</b> &nbsp;&nbsp;
                    Levels: &nbsp;&nbsp;
                    <span>{level_control()}</span>
                </div>
            </div>
            <div className="tiles" onScroll={(e) => {
                document.querySelector(".tiles .heading").style.left = -(e.target.scrollLeft) + 'px';
                document.querySelector(".tiles .heading-left").style.top = -(e.target.scrollTop - e.target.offsetTop) + 'px';
                console.log(e.target.scrollTop, e.target.scrollLeft);
            }}>


                <div className="col tile_corner">&nbsp;</div>

                <div key={`row_header`} className="row heading">

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

                <div className="row heading-left">
                    {mapdata.map((col, y) => (
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
                    ))}
                </div>

                {mapdata.map((col, y) => (<div key={`row_${y}`} className="row">
                    {col.map((tile_id, x) => makeTile(tile_id, x, y))}
                </div>))}
            </div>
        </div>
    );

}
export default MapPanel;