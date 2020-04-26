import React, { useState, useEffect, useRef } from "react";

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

        let { path: filepath, width, height, wCount, hCount, getScale } = elements[txtbg];

        for (let j = 0; j < hCount; j++) {

            for (let i = 0; i < wCount; i++) {
                const key = i + (j * wCount);
                const selected = txtid == key ? ' selected ' : "";
                html.push(<div key={key} className={selected + 'selector_tile t' + key}
                    onClick={() => setID(key)} >

                    <img style={{
                        width: width * getScale(tile_size),
                        left: (-i * tile_size) + 'px', top: (-j * tile_size) + 'px'
                    }} src={filepath} />

                    <div>ID: {key}-{j}:{i}</div>
                </div>)
            }
        }
        return html;
    }

    return (
        <div style={{
            '--selector-tile-size': tile_size + 'px',
        }} className="tile_selector">{load()}</div>
    );
}

export default ItemTileSelector;