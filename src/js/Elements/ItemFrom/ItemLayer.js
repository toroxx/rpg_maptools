import React, { useState, useEffect, useRef } from "react";
import ItemTileSelector from './ItemTileSelector';

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

export default ItemLayer;