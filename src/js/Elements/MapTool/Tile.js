import React, { useState, useEffect, useRef } from "react";




const Tile = (props) => {
    let elem = useRef(null);
    const { width = 65, tileCache = {}, tiledata = '-void-', x = null, y = null,
        onClick = () => { },
        onContextMenu = () => { } } = props;

    let className = ['col', 'tile'];
    let tilename = null;


    let tile_id = tiledata;
    let info_id = null;

    if (tiledata != null && typeof (tiledata) == "object") {
        let { TileID = null, InfoID = null } = tiledata;
        tile_id = TileID;
        info_id = InfoID;
    }
    //console.log(tiledata, tile_id, info_id);

    if (tile_id != null) {
        className.push(tile_id);
    }
    if (info_id != null) {
        className.push(info_id);
    }
    if (x != null) {
        className.push('col_' + x);
    }
    if (y != null) {
        className.push('row_' + y);
    }
    if (x != null && y != null) {
        tilename = `tile-${x}-${y}`;
        className.push(tilename);
    }

    function mkLayer(tile_id) {
        let tile = tileCache[tile_id];

        if (tile != void (0)) {
            return tile.map((v, k) => {
                let [type, elemfunc = () => { }] = v;

                if (type == "top") {
                    return elemfunc();
                }
                return elemfunc(width);
            })
        }
    }

    return (<div ref={elem}
        style={{ 'width': width + 'px', 'height': width + 'px' }}
        data-x={x} data-y={y}
        data-tilename={tilename} data-info_id={info_id} data-tile_id={tile_id}

        className={className.join(' ')}
        onClick={(e) => {
            e.preventDefault();
            onClick(elem.current)
        }}
        onContextMenu={(e) => {
            e.preventDefault();
            onContextMenu(elem.current)
        }}>

        {mkLayer(tile_id)}

        <div className="tile_layers tile_info_layer">
            <table><tbody><tr><td align="center"> {info_id} </td></tr></tbody></table>
        </div>
    </div>)
}

export default Tile;