import React, { useState, useEffect, useRef } from "react";
import * as Util from '../Lib/Util';
const { getCurrentWindow, dialog } = electron.remote;

let options = { 'walkover': 0, 'movedown': 1, 'moveleft': 1, 'moveup': 1, 'moveright': 1 };



const ItemTileSelector = (props) => {
    let { elements, txtbg, txtid, setID } = props;

    let [scale, setScale] = useState(0);
    let [wCount, setWCount] = useState(0);
    let [hCount, setHCount] = useState(0);

    let tile_selector = useRef(null);



    useEffect(() => {
        if (elements[txtbg]) {
            let { tile_size, width, height } = elements[txtbg];

            setScale(width * 50 / tile_size);
            setWCount(width / tile_size);
            setHCount(height / tile_size);

        }

    }, [txtbg, txtid]);


    return (
        <div ref={tile_selector} className="tile_selector" style={{
            'width': '90%', resize: 'both', 'clear': 'both',
            overflowX: 'hidden', overflowY: 'auto', 'height': '60px', border: '1px solid #000'
        }}>

            {[...Array(hCount)].map((y, j) => {
                return [...Array(wCount)].map((x, i) => {
                    const key = i + (j * wCount);
                    return (<div key={key} className={'t' + key}
                        style={{
                            border: txtid == key ? '1px solid #f00' : '1px solid #000',
                            'float': 'left',
                            'display': 'inline-block', position: 'relative',
                            width: '50px', height: '50px', padding: '0px', overflow: 'hidden'
                        }}
                        onClick={() => setID(key)} >

                        <img style={{
                            position: 'absolute', width: scale + 'px',
                            left: '-' + (i * 50) + 'px', top: '-' + (j * 50) + 'px'
                        }}
                            src={elements[txtbg] && elements[txtbg]['path'] || null} />
                        <div style={{
                            position: 'absolute', fontSize: '8px', fontWeight: 'bold', width: '100%',
                            height: "100%", backgroundColor: txtid == key ? 'rgba(255, 0, 0, 0.2)' : null
                        }}>
                            ID: {key}-{j}:{i}
                        </div>
                    </div>)
                });
            })}

        </div>
    );
}


const ItemLayer = (props) => {
    let { index, elements, layer, setTileLayer, removeTileLayer } = props;

    const { bg, id = 0, zIndex = 1, name = "" } = layer;
    let [txtbg, setBg] = useState(bg);
    let [txtid, setID] = useState(id);
    let [txtname, setName] = useState(name);
    let [txtzIndex, setZIndex] = useState(zIndex);

    useEffect(() => {
        //console.log(11, txtbg, txtid, txtzIndex);
        setTileLayer(index, { bg: txtbg, id: txtid, zIndex: txtzIndex, name: txtname });
    }, [txtbg, txtid, txtzIndex, txtname]);

    return (<div className="layer">
        BG:&nbsp;
        <select className="bg" defaultValue={txtbg} onChange={(e) => setBg(e.target.value)} >
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


        <button onClick={() => removeTileLayer(index)}>Del</button>
        <ItemTileSelector elements={elements} txtbg={txtbg} txtid={txtid} setID={setID} />
    </div>);
}


const ItemForm = (props) => {
    let { elements, tileCache, tiledata, setTiles, editItem, setEditItem } = props;
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

            console.log(tid, tile_selected);
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
                            <div style={{
                                backgroundColor: '#000',
                                border: '1px solid #000',
                                'display': 'inline-block', position: 'relative',
                                width: '80px', height: '80px', padding: '0px', overflow: 'hidden'
                            }} >
                                {tile_layers.map((tile_layer, i) => {
                                    let { bg, id, zIndex = 1, name = "" } = tile_layer;


                                    if (elements[bg]) {
                                        let { row_per_tile, tile_size, width, height } = elements[bg];
                                        const row = Math.floor(id / row_per_tile) * 80;
                                        const col = (id % row_per_tile) * 80;

                                        return (<img className={name} key={i} style={{
                                            position: 'absolute', width: (width * 80 / tile_size) + 'px',
                                            left: '-' + col + 'px', top: '-' + row + 'px', zIndex: zIndex
                                        }} src={elements[bg].path} />)
                                    }

                                })}

                                <div style={{ width: '100%', 'height': '100%' }} className={Util.tileOptionClasses([], tile_options).join(' ')}> </div>
                            </div>

                        </td>
                    </tr>
                    <tr>
                        <td valign="top">Options</td>
                        <td>
                            <div className="options">
                                {Object.keys(options).map((key) => {
                                    let checked = (tile_options && tile_options[key]) ? 1 : 0;

                                    return (
                                        <div key={key} className="opt">
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