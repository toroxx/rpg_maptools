const { getCurrentWindow, dialog } = electron.remote;

function load(filename) {
    const file_path = dialog.showOpenDialogSync(getCurrentWindow(), {
        title: 'Load Map',
        defaultPath: filename,
        properties: ['openFile'],
        filters: [
            { name: 'Json Maps', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (!file_path || file_path.length == 0) {
        return false;
    }

    return [path.basename(file_path[0]), fs.readFileSync(file_path[0], { encoding: 'utf8', flag: 'r' })];
}

function save(filename, data) {

    const file_path = dialog.showSaveDialogSync(getCurrentWindow(), {
        title: 'Save Maps',
        defaultPath: filename,
        properties: ['openFile'],
        filters: [
            { name: 'Json Maps', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (!file_path || file_path.length == 0) {
        return false;
    }

    fs.writeFileSync(file_path, data, { encoding: 'utf8', flag: 'w+' });

    dialog.showMessageBoxSync(getCurrentWindow(), {
        'type': 'info',
        'title': 'Save Map',
        'message': 'Map File Saved: ' + file_path,

    });
    return [path.basename(file_path)]

}

export {
    load,
    save
}