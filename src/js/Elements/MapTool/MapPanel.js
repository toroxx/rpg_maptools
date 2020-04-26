import React, { useState, useEffect } from "react";
import * as Util from '../../Lib/Util';
import Tile from './Tile';
import * as MapUtil from './MapUtil';
import AnimateClock from '../AnimateClock';

let ctrl_pressed = false;


const MapPanel = (props) => {
    const { elements,
        mapTileOption, setMapTileOption,
        tiledata, mapdata, setMap,
        selectedTiles, setSelectedTiles,
        selectedItem, editItem, setEditItem } = props;

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
        new AnimateClock(mapdata, tiledata, mapTileOption);
    }, [mapdata, tiledata, mapTileOption])


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

    function setTile(x, y, tileinfo) {
        let tileData = getTile(x, y);
        if (!tileData) {
            mapdata[y][x] = tileinfo;
        } else {

            if (typeof (tileData) == 'string' && typeof (tileinfo) == 'string') {
                tileData = { 'TileID': tileinfo };
            } else {
                tileData = tileinfo;
            }

            mapdata[y][x] = tileData;
        }
        setMap(mapdata);
    }
    function setTileInfoID(x, y, InfoID) {
        let tileData = getTile(x, y);
        if (tileData) {
            if (typeof (tileData) == 'string') {
                tileData = { 'TileID': tileData };
            }
            if (InfoID != null) {
                tileData["InfoID"] = InfoID;
            } else {
                delete (tileData["InfoID"]);
            }

            mapdata[y][x] = tileData;
            setMap(mapdata);
        }

    }


    const menu_callback = (action, target) => {
        //console.log(action, target);
        const tilename = target.getAttribute('data-tilename');
        const x = target.getAttribute('data-x');
        const y = target.getAttribute('data-y');

        let col_items = mapdata[0].length;

        let empty_row = [];
        for (let i = 0; i < col_items; i++) { empty_row.push('-void-'); }
        let copied_object = Util.clipboard_read();

        switch (action) {
            case 'Insert Row':
                dialogs.prompt('Insert Row', 1, ok => {
                    if (ok) {
                        let tmpMap = MapUtil.rowInsert(mapdata, y, empty_row, parseInt(ok));
                        if (tmpMap !== false) { setMap(tmpMap); }
                    }
                });

                break;
            case 'Append Row':

                dialogs.prompt('Append Row', 1, ok => {
                    if (ok) {
                        let tmpMap = MapUtil.rowAppend(mapdata, y, empty_row, parseInt(ok));
                        if (tmpMap !== false) { setMap(tmpMap); }
                    }
                });

                break;
            case 'Delete Row':
                setMap(MapUtil.rowRemove(mapdata, y));
                break;
            case 'Copy Row':
                Util.clipboard_write({ type: 'row', name: tilename, value: y });
                break;
            case 'Paste Row':
                if (copied_object != null && copied_object['type'] == "row") {
                    let tmpMap = MapUtil.rowReplace(mapdata, y, copied_object['value']);
                    setMap(tmpMap);
                }
                break;
            case 'Insert Col':
                dialogs.prompt('Insert Col', 1, ok => {
                    if (ok) {
                        let tmpMap = MapUtil.colInsert(mapdata, x, '-void-', parseInt(ok));
                        if (tmpMap !== false) { setMap(tmpMap); }
                    }
                });

                break;
            case 'Append Col':
                dialogs.prompt('Append Col', 1, ok => {
                    if (ok) {
                        let tmpMap = MapUtil.colAppend(mapdata, x, '-void-', parseInt(ok));
                        if (tmpMap !== false) { setMap(tmpMap); }
                    }
                });
                break;
            case 'Delete Col':
                setMap(MapUtil.colRemove(mapdata, x));
                break;
            case 'Copy Col':
                Util.clipboard_write({ type: 'col', name: tilename, value: x });
                break;
            case 'Paste Col':
                if (copied_object != null && copied_object['type'] == "col") {
                    let tmpMap = MapUtil.colReplace(mapdata, y, copied_object['value']);
                    setMap(tmpMap);

                }
                break;
            case 'Copy Tile':
                Util.clipboard_write({ type: 'tile', name: tilename, value: mapdata[y][x] });
                console.log('Copy Tile', mapdata[y][x]);
                break;
            case 'Paste Tile':
                if (copied_object != null) {
                    const { type = null, value } = copied_object;

                    if (type == "tile") {
                        console.log('Copy Tile', value)
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

        let copied_object = Util.clipboard_read();
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

        let copied_object = Util.clipboard_read();
        if (copied_object != null) {
            const { type = null, name } = copied_object;
            if (type == "row") {
                menu4left.append(new MenuItem({ label: 'Paste row (' + name + ')', click: () => { menu_callback('Paste Row', node) } }))
            }
        }
        menu4left.popup({ window: remote.getCurrentWindow() })
    }


    function tile_menu(node) {

        let tilename = node.getAttribute('data-tilename');
        let tile_id = node.getAttribute('data-tile_id');
        let info_id = node.getAttribute('data-info_id');
        let data_x = node.getAttribute('data-x');
        let data_y = node.getAttribute('data-y');
        if (tilename == null) {
            return;
        }
        const menu4tile = new Menu()

        menu4tile.append(new MenuItem({ label: tilename, enabled: false }))
        menu4tile.append(new MenuItem({ type: 'separator' }))


        menu4tile.append(new MenuItem({
            label: 'Info ID' + (info_id != null ? ` (${info_id})` : ""), click: () => {
                dialogs.prompt("Info ID", info_id, ok => {

                    if (ok == void (0)) {
                        return;
                    }
                    info_id = ok;

                    let tmp = mapTileOption;
                    if (ok != "") {
                        console.log('set InfoID:', data_x, data_y, ok);

                        if (mapTileOption[info_id] == void (0)) {
                            mapTileOption[info_id] = {
                                autostart_ani: false, entrypoint: false, framePerLoop: 10,
                            };
                        }
                        console.log('mapTileOption:', mapTileOption);
                    }

                    //mapTileOption[info_id] = ok;
                    setTileInfoID(data_x, data_y, ok == "" ? null : ok);

                    setMapTileOption({ ...tmp });

                })
            }
        }))

        if (mapTileOption[info_id] != void (0)) {
            let { autostart_ani = false, entrypoint = false, framePerLoop = 10 } = mapTileOption[info_id];


            menu4tile.append(new MenuItem({
                type: 'checkbox',
                label: 'Auto Start Animate',
                checked: autostart_ani,
                click: () => {
                    mapTileOption[info_id]['autostart_ani'] = !autostart_ani;
                    setMapTileOption({ ...mapTileOption });
                }
            }))
            menu4tile.append(new MenuItem({
                label: `Animate FramePerLoop (${framePerLoop})`, click: () => {
                    dialogs.prompt("Animate FramePerLoop", framePerLoop, ok => {
                        if (ok != void (0) && ok != "") {
                            mapTileOption[info_id]['framePerLoop'] = parseInt(ok);
                            setMapTileOption({ ...mapTileOption });
                        }
                    })
                }
            }))

            menu4tile.append(new MenuItem({
                type: 'checkbox',
                label: 'Set EntryPoint',
                checked: entrypoint,
                click: () => {
                    mapTileOption[info_id]['entrypoint'] = !entrypoint;
                    setMapTileOption({ ...mapTileOption });
                }
            }));
        }


        menu4tile.append(new MenuItem({ type: 'separator' }))
        menu4tile.append(new MenuItem({ label: 'Copy Tile', click: () => { menu_callback('Copy Tile', node) } }))

        if (tile_id != "" && tile_id != "-void-") {

            menu4tile.append(new MenuItem({ label: 'Edit Tile', click: () => { setEditItem(tile_id) } }))
        }

        let copied_object = Util.clipboard_read();
        if (copied_object != null) {
            const { type = null, name } = copied_object;
            if (type == "tile") {
                menu4tile.append(new MenuItem({ label: 'Paste Tile (' + name + ')', click: () => { menu_callback('Paste Tile', node) } }))
            }
        }
        menu4tile.append(new MenuItem({ type: 'separator' }))
        menu4tile.append(new MenuItem({
            label: 'Copy JSON', click: () => {
                Util.clipboard_write(JSON.stringify({ 'type': 'tiledata', name: tile_id, value: tiledata[params] }));
            }
        }))
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


    function makeTile(tiledata, x, y) {
        return (<Tile key={`tile_${x}_${y}`} tiledata={tiledata} tileCache={tileCache} x={x} y={y}
            onClick={(target) => {

                console.log(target);
                select_tile(target, x, y);

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
                    {col.map((tiledata, x) => makeTile(tiledata, x, y))}
                </div>))}
            </div>
        </div>
    );

}
export default MapPanel;