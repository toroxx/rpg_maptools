import React, { useState, useEffect } from "react";




const Tile = (props) => {
    const { width=65, tile=[], tile_id = null, x = null, y = null,
        onClick = () => { },
        onContextMenu = () => { } } = props;

    let className = ['col', 'tile'];
    let tilename = null;
    if (tile_id != null) {
        className.push(tile_id);
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
    return (<div
        style={{ 'width': width + 'px', 'height': width + 'px' }}
        data-x={x} data-y={y}
        data-tilename={tilename}
        data-tile_id={tile_id} className={className.join(' ')}
        onClick={(e) => { onClick(e) }}
        onContextMenu={(e) => { onContextMenu(e) }}>

        {tile.map((v, k) => {
            let [type, elemfunc = () => { }] = v;

            if (type == "top") {
                return elemfunc();
            }
            return elemfunc(width);
        })}
        
    </div>)
}

export default Tile;