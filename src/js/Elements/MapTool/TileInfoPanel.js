import React, { useState, useEffect } from "react";
import * as Util from '../../Lib/Util';
import Tile from './Tile';




const TileinfoPanel = (props) => {
    const { mapTileOption, setMapTileOption, } = props;


    function tileinfo_menu(e) {
        const info_id = e.target.getAttribute('data-info_id');

        const menu4tile = new Menu()
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

        menu4tile.append(new MenuItem({
            label: 'Delete', click: () => {
                let tmp = mapTileOption;
                delete (tmp[info_id]);
                setMapTileOption({ ...tmp });
            }
        }))
        menu4tile.popup({ window: remote.getCurrentWindow() })
    }

    return (
        <div className="tileinfo_panel">
            <div className="title_bar" onContextMenu={(e) => {
                //panel_menu(e);
            }}>
                <b>&nbsp; Tile Info </b>

                <a style={{ cursor: 'pointer' }} onClick={() => {

                    dialogs.prompt("Info ID", "", ok => {
                        if (ok != void (0) && ok != "") {
                            let info_id = ok;

                            let tmp = mapTileOption;
                            if (mapTileOption[info_id] == void (0)) {
                                mapTileOption[info_id] = {
                                    autostart_ani: false, entrypoint: false, framePerLoop: 10,
                                };
                            }

                            setMapTileOption({ ...tmp });
                        }
                    })

                }}>&#10133;</a>
            </div>
            <div className="itemlist tileinfos" >
                {Object.keys(mapTileOption).map((k) => {
                    let { autostart_ani = false, entrypoint = false, framePerLoop = 10 } = mapTileOption[k];

                    return (<div key={k} data-info_id={k} className={'tileinfo ' + k} style={{
                        fontSize: '10px',
                        padding: '5px',
                        width: '100%',
                        'borderBottom': '2px solid #000',
                        backgroundColor: '#aaa',
                    }} onContextMenu={(e) => { tileinfo_menu(e) }}><span style={{ fontSize: '12px', fontWeight: 'bold' }}>{k}</span><br />
                        <b>AutoStart Animate:</b> {autostart_ani ? 1 : 0}, <br />
                        <b>FramePerLoop:</b> Frame: <span className="frame">0</span>/{framePerLoop}<br />
                        <b>Entrypoint:</b> {entrypoint ? 1 : 0}, <br />

                    </div>)
                })}
            </div>
        </div>
    );
}
export default TileinfoPanel;