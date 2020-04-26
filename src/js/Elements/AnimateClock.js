
function ani_callback(tile_ani_layer, InfoID, TileID, framePerLoop, y, x, txtClock) {
    let { layers } = tile_ani_layer;
    let anis = {};
    let closest = 0;
    for (let k in layers) {
        let { name, ani } = layers[k];
        ani = parseFloat(ani) * framePerLoop;
        anis[ani] = name;

        if (txtClock > ani) {
            closest = ani;
        }

    }
    for (let ani in anis) {
        document.querySelector('.tiles').querySelectorAll(`.tile.${InfoID}.${TileID} .${anis[ani]}`).forEach(e => {
            e.style.display = ani == closest ? 'block' : 'none';
        });
    }

}

let ani_clock = {};
let ani_txtclock = {};

export default function AnimateClock(mapdata, tiledata, mapTileOption) {

    console.log('ani_clock:', ani_clock);
    for (let k in ani_clock) {
        clearInterval(ani_clock[k]);
    }

    ani_clock = {};
    ani_txtclock = {};
    console.log('Old Clocks clear');

    let autoani_info_ids = {};
    for (let k in mapTileOption) {
        let { autostart_ani = false, framePerLoop = 10 } = mapTileOption[k];
        if (autostart_ani) {
            autoani_info_ids[k] = framePerLoop;
        }
    }

    let antoani_tile_ids = [];
    let antoani_tiles = {};
    for (let y in mapdata) {
        for (let x in mapdata[y]) {
            let { InfoID, TileID } = mapdata[y][x];


            if (autoani_info_ids[InfoID]) {
                let framePerLoop = autoani_info_ids[InfoID];
                antoani_tiles[TileID] = InfoID;
                antoani_tile_ids.push([InfoID, TileID, framePerLoop, y, x]);
            }
        }
    }

    let tile_ani_layer = {};
    for (let v in tiledata) {
        if (antoani_tiles[v] == void (0)) {
            continue;
        }
        let { layers } = tiledata[v];

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
            tile_ani_layer[v] = { layers: ordered, };
        }
    }

    for (let v in antoani_tile_ids) {
        let [InfoID, TileID, framePerLoop, y, x] = antoani_tile_ids[v];
        console.log('Clock:', InfoID, TileID, framePerLoop, y, x, 'start');

        const clock_key = `${InfoID}, ${TileID}, ${framePerLoop}, ${y}, ${x}`;
        if (ani_txtclock[clock_key] == void (0)) {
            ani_txtclock[clock_key] = 0;
        }

        ani_clock[clock_key] = setInterval(() => {

            ani_callback(tile_ani_layer[TileID], InfoID, TileID, framePerLoop, y, x, ani_txtclock[clock_key] + 1);
            document.querySelector('.tileinfo.' + InfoID + ' span.frame').innerHTML = ani_txtclock[clock_key] + 1;

            ani_txtclock[clock_key] = (ani_txtclock[clock_key] + 1) % framePerLoop;
        }, 100);
    }
    console.log("ani_clock: ", ani_clock);
}

