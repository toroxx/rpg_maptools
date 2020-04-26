import React, { useState, useEffect, useRef } from "react";
import * as Util from '../../Lib/Util';
import ItemLayer from './ItemLayer';

const { getCurrentWindow, dialog } = electron.remote;

let options = {
    'walkover': 0, 'movedown': 1, 'moveleft': 1, 'moveup': 1, 'moveright': 1,
    'eventdown': 0, 'eventleft': 0, 'eventup': 0, 'eventright': 0
};


const ItemForm = (props) => {
    let { elements, tiledata, setTiles, editItem, setEditItem } = props;

    let [formdisplay, setformdisplay] = useState(false);

    let [tile_id, setTileID] = useState(editItem);
    let [tile_layers, setTileLayers] = useState([]);
    let [tile_options, setTileOptions] = useState(options);

    useEffect(() => {
        console.log('editItem', editItem);

        if (editItem != null) {
            setTileID(editItem);

            if (editItem != "" && editItem != "-void-") {
                let tmp = (tiledata[editItem] && tiledata[editItem]['layers']) || [];
                console.log('editItem data', tmp);
                setTileLayers([...tmp]);
                setTileOptions({ ...tiledata[editItem] });

                setformdisplay(true);
                return
            }
        }
        setTileLayers([]);
        setTileOptions(options);
        setformdisplay((editItem != null) ? true : false);
    }, [editItem]);

    useEffect(() => {
        let layers = document.querySelector('.itemForm').querySelectorAll('.layer');
        layers.forEach((v) => {
            let tid = v.querySelector('input.id').value;
            let tile_selected = v.querySelector('.tile_selector').querySelector('.t' + tid);

            if (tile_selected) {
                tile_selected.scrollIntoView(true);
            }

        })
    }, [tile_layers])


    const setTileLayer = (i, layer) => {
        let tmp = tile_layers;
        tmp[i] = layer;
        setTileLayers([...tmp]);
    };

    const setTileOption = (k, v) => {
        let tmp = tile_options;
        tmp[k] = v;
        setTileOptions({ ...tmp })
    }
    const removeTileLayer = (i) => {
        let tmp = [];
        for (let k in tile_layers) { if (k != i) { tmp.push(tile_layers[k]); } }
        setTileLayers([...tmp]);
    };

    const saveItem = () => {
        let tmp = tiledata;
        if (tile_id == "") {
            dialog.showMessageBoxSync(getCurrentWindow(), {
                'type': 'error',
                'title': 'Save Tile',
                'message': 'Tile ID cannot be null',

            });
            return;
        }
        tmp[tile_id] = { ...tile_options, layers: tile_layers };
        setTiles(tmp);
        setEditItem(null);
    }

    return (
        <div className="itemForm" style={{
            overflowX: 'hidden', overflowY: 'auto',
            width: '80%', 'height': '80%',
            'display': formdisplay == false ? 'none' : 'block'
        }}>
            <table border="0" style={{ width: '100%' }}>
                <tbody>
                    <tr>
                        <td>
                            ID:  <input name="id" value={tile_id || ""} onChange={(e) => setTileID(e.target.value)} />
                            <a style={{ cursor: 'pointer' }} onClick={() => { saveItem() }}> &#128190; </a> &nbsp;&nbsp;&nbsp;&nbsp;
                        </td>
                        <td align="right">

                            <a style={{ cursor: 'pointer' }} onClick={() => { setEditItem(null); }}> &#10060; </a>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table border="0" style={{ width: '100%' }}>
                <tbody>


                    <tr>
                        <td style={{ width: '15%' }} valign="top">
                            Layers <a style={{ cursor: 'pointer' }} onClick={() => { setTileLayer(tile_layers.length, []) }}> &#10133; </a>
                        </td>
                        <td>
                            <div className="layers">
                                {tile_layers.map((tile_layer, i) => {
                                    return <ItemLayer key={i} index={i} elements={elements} layer={tile_layer} setTileLayer={setTileLayer} removeTileLayer={removeTileLayer} />
                                })}
                            </div>
                        </td>
                        <td valign="top" rowSpan="2">
                            Sample:<br />
                            <div className={'tile'} style={{
                                backgroundColor: '#000',
                                border: '1px solid #000',
                                'display': 'inline-block', position: 'relative',
                                width: '80px', height: '80px', padding: '0px', overflow: 'hidden'
                            }} >
                                {Util.makeTileLayers(elements, tile_id, { ...tile_options, 'layers': tile_layers }).map((v, i) => {
                                    let [type, elemfunc = () => { }] = v;

                                    if (type == "top") {
                                        return elemfunc();
                                    }
                                    return elemfunc(80);
                                })}

                            </div>

                        </td>
                    </tr>
                    <tr>
                        <td valign="top">Options</td>
                        <td>
                            <div className="options">
                                {Object.keys(options).map((key) => {
                                    let checked = options[key];
                                    if ((tile_options && tile_options[key]) !== void (0)) {
                                        checked = (tile_options && tile_options[key]);
                                    }
                                    //console.log(key, checked, options[key], (tile_options && tile_options[key]));
                                    return (
                                        <div key={key} className="opt" style={{ display: 'inline-block', padding: '5px' }}>
                                            <b>{key}:</b>
                                            <input name={key} type="checkbox" checked={checked == 1}
                                                onChange={(e) => setTileOption(key, e.target.checked ? 1 : 0)} />
                                        </div>)

                                })}

                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default ItemForm;