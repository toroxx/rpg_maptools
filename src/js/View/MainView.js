import React, { useState, useEffect } from "react";
const { getCurrentWindow } = electron.remote;

const MainView = (props) => {

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div className="itemForm">
                <table border="0" style={{ width: '100%' }}>
                    <tbody>

                        <tr>
                            <td colSpan="2">ID: <input name="id" /> <button onClick={() => { window.saveitem() }}>Update</button></td>
                        </tr>
                        <tr>
                            <td style={{ width: '15%' }} valign="top">
                                Layers <button onClick={() => { window.addlayer() }}> ADD </button>
                            </td>
                            <td>
                                <div className="layers"></div>
                            </td>
                        </tr>
                        <tr>
                            <td valign="top">
                                Options
                        </td>
                            <td>
                                <div className="options"></div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="editor">
                <div className="items_panel">
                    <div className="title_bar">
                        <b>&nbsp; ITEMS </b>

                        <button onClick={() => { window.createitem() }}>Add</button>
                        <button onClick={() => { window.hiddenlines() }}>HiddenLine</button>
                        <button onClick={() => { window.showlines() }}>ShowLine</button>
                    </div>


                    <div className="itemlist">
                    </div>
                </div>
                <div className="map_panel">
                    <div className="title_bar">
                        <div style={{ float: 'left' }}>
                            <b>&nbsp; MAP</b>

                            &nbsp;

                            Add:
                            <button onClick={() => { window.insertMapRow() }}>IRow</button>
                            <button onClick={() => { window.insertMapCol() }}>ICol</button>
                            <button onClick={() => { window.addMapRow() }}>Row</button>
                            <button onClick={() => { window.addMapCol() }}>Col</button>
                            Copy:
                            <button onClick={() => { window.copyMapRow() }}>Row</button>
                            <button onClick={() => { window.copyMapCol() }}>Col</button>
                            Del:
                            <button onClick={() => { window.removeMapRow() }}>Row</button>
                            <button onClick={() => { window.removeMapCol() }}>Col</button>
                            &nbsp;
                            Selected: <span className="selected"></span>
                        </div>



                        <div className="fileloader" style={{ float: 'right' }}>
                            &nbsp;
                            Map File: <input type="file" className="load" /><button onClick={() => { window.importFile() }}>Import</button>

                            &nbsp; | &nbsp;
                            <button onClick={() => { window.exportFile() }}>Export</button>
                            &nbsp;
                        </div>

                    </div>

                    <div className="tiles"></div>
                </div>
            </div>
        </div>
    );


}



export default MainView;