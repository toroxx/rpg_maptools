import React, { useState, useEffect, useRef } from "react";
import * as Util from '../Lib/Util';
const { getCurrentWindow, dialog } = electron.remote;

let options = {
    'walkover': 0, 'movedown': 1, 'moveleft': 1, 'moveup': 1, 'moveright': 1,
    'autostart_ani': 0, 'eventdown': 0, 'eventleft': 0, 'eventup': 0, 'eventright': 0
};



const ItemTileSelector = (props) => {
    let { elements, txtbg, txtid, setID } = props;


    let tile_size = 50;

    useEffect(() => {
        console.log('Loading: ', txtbg);
    }, [txtbg, txtid]);

    function load() {
        let html = [];
        if (elements[txtbg] == void (0)) {
            return html;
        }

        let { width, height, wCount, hCount, getScale } = elements[txtbg];

        for (let j = 0; j < hCount; j++) {

            for (let i = 0; i < wCount; i++) {
                const key = i + (j * wCount);
                html.push(<div key={key} className={'t' + key}
                    style={{
                        border: txtid == key ? '1px solid #f00' : '1px solid #000',
                        'float': 'left',
                        'display': 'inline-block', position: 'relative',
                        width: tile_size + 'px', height: tile_size + 'px', padding: '0px', overflow: 'hidden'
                    }}
                    onClick={() => setID(key)} >

                    <img style={{
                        position: 'absolute', width: width * getScale(tile_size) + 'px',
                        left: '-' + (i * tile_size) + 'px', top: '-' + (j * tile_size) + 'px'
                    }} src={elements[txtbg] && elements[txtbg]['path'] || null} />

                    <div style={{
                        position: 'absolute', fontSize: '8px', fontWeight: 'bold', width: '100%',
                        height: "100%", backgroundColor: txtid == key ? 'rgba(255, 0, 0, 0.2)' : null
                    }}>
                        ID: {key}-{j}:{i}
                    </div>
                </div>)
            }
        }
        return html;
    }

    return (
        <div className="tile_selector" style={{
            'width': '90%', resize: 'both', 'clear': 'both',
            overflowX: 'hidden', overflowY: 'auto', 'height': '60px', border: '1px solid #000'
        }}>{load()}</div>
    );
}


const ItemLayer = (props) => {
    let { index, elements, layer, setTileLayer, removeTileLayer } = props;

    const { bg, id = 0, zIndex = 1, name = "", ani = "" } = layer;
    let [txtbg, setBg] = useState(bg);
    let [txtid, setID] = useState(id);
    let [txtname, setName] = useState(name);
    let [txtzIndex, setZIndex] = useState(zIndex);
    let [txtani, setAni] = useState(ani);

    useEffect(() => {
        console.log('savelayer', txtbg, txtid, txtzIndex, txtani);
        setTileLayer(index, {
            bg: txtbg, id: txtid, zIndex: txtzIndex, name: txtname,
            ani: txtani
        });
    }, [txtbg, txtid, txtzIndex, txtname, txtani]);

    return (<div className="layer">
        BG:&nbsp;
        <select className="bg" defaultValue={txtbg} onChange={(e) => {
            if (e.target.value != '') { setBg(e.target.value) }
        }} >
            <option></option>
            {Object.keys(elements).map((k2) => {
                return (<option key={k2}>{k2}</option>);
            })};
        </select>
        TileID:&nbsp;
        <input style={{ width: '50px' }} type="text" className="id"
            value={txtid} onChange={(e) => setID(e.target.value)} />

        zIndex:&nbsp;
        <input style={{ width: '50px' }} type="text" className="zIndex"
            value={txtzIndex} onChange={(e) => setZIndex(e.target.value)} />

        Name:&nbsp;
        <input style={{ width: '50px' }} type="text" className="name"
            value={txtname} onChange={(e) => setName(e.target.value)} />

        Ani Frm:&nbsp;
        <input style={{ width: '50px' }} type="text" className="ani"
            value={txtani} onChange={(e) => setAni(e.target.value)} />



        <button onClick={() => removeTileLayer(index)}>Del</button>
        <ItemTileSelector elements={elements} txtbg={txtbg} txtid={txtid} setID={setID} />
    </div>);
}


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