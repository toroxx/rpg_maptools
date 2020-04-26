export function rowInsert(mapdata, y, row_data, count) {
    if (isNaN(count) || count <= 0) {
        return false;
    }
    let tmpMap = [];
    mapdata.forEach((v, py) => {
        if (py == y) {
            for (let i = 0; i < count; i++) {
                tmpMap.push(row_data);
            }
        }
        tmpMap.push(v);
    })
    return tmpMap;
}

export function rowAppend(mapdata, y, row_data, count) {
    if (isNaN(count) || count <= 0) {
        return false;
    }
    let tmpMap = [];
    mapdata.forEach((v, py) => {
        tmpMap.push(v);
        if (py == y) {
            for (let i = 0; i < count; i++) {
                tmpMap.push(row_data);
            }
        }
    })
    return tmpMap;
}

export function rowRemove(mapdata, y) {
    let tmpMap = [];
    mapdata.forEach((v, py) => {
        if (py != y) { tmpMap.push(v); }
    })
    return tmpMap;
}

export function rowReplace(mapdata, y, value) {
    let tmpMap = [];
    mapdata.forEach((v, py) => {
        tmpMap.push((py == y) ? mapdata[value] : v);
    })
    return tmpMap;
}

export function colInsert(mapdata, x, col_data, count) {
    if (isNaN(count) || count <= 0) {
        return false;
    }

    let tmpMap = [];
    mapdata.forEach((cols, py) => {
        let tmp = [];
        cols.forEach((col, px) => {
            if (px == x) {
                for (let i = 0; i < count; i++) {
                    tmp.push(col_data);
                }
            }
            tmp.push(col);
        })
        tmpMap.push(tmp);
    });
    return tmpMap;
}

export function colAppend(mapdata, x, col_data, count) {
    if (isNaN(count) || count <= 0) {
        return false;
    }

    let tmpMap = [];
    mapdata.forEach((cols, py) => {
        let tmp = [];
        cols.forEach((col, px) => {

            tmp.push(col);
            if (px == x) {
                for (let i = 0; i < count; i++) {
                    tmp.push(col_data);
                }
            }
        })
        tmpMap.push(tmp);
    });
    return tmpMap;
}

export function colRemove(mapdata, x) {
    let tmpMap = [];
    mapdata.forEach((cols, py) => {
        let tmp = [];
        cols.forEach((col, px) => {
            if (px != x) {
                tmp.push(col);
            }
        })
        tmpMap.push(tmp);
    });
    return tmpMap;
}

export function colReplace(mapdata, x, value) {
    let tmpMap = [];
    mapdata.forEach((cols, py) => {
        let tmp = [];
        cols.forEach((col, px) => {
            tmp.push((px == x) ? cols[value] : col);
        })
        tmpMap.push(tmp);
    });
    return tmpMap;
}