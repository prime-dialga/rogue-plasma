const { app, BrowserWindow, net } = require('electron');
const path = require('node:path');
const fs = require('node:fs').promises;
const {spawn} = require('node:child_process');
const kill = require('tree-kill');

let error = null;
let config = {};
let child = null;
let childStdInBuffer = '';
let waitingForChild = false;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
	app.quit();
}


// tests whether the server is online by sending a request
async function serverOnline(url){
	try{
		await net.fetch(url);
	}catch(err){
		return false
	}
	return true;
}


try{
	config = require(path.resolve('./config.json'));
}catch(err){
	error = `Failed to load config! (${err.message?.split('\n')[0] || err})`;
}



const createWindow = () => {
	// check if the game has loaded
	if(waitingForChild){
		// otherwise await
		setTimeout(createWindow, 1000);
	}else{
		// Create the browser window.
		const mainWindow = new BrowserWindow({
		width: config.width,
		height: config.height,
		webPreferences: {
			nodeIntegration: false, // secure the browser
			sandbox: true,
		},
		icon: config.location ? config.location + '/favicon.ico' : undefined,
		});
		mainWindow.removeMenu(); // removes the menu

		// and load the index.html of the app.
		mainWindow.loadURL(error ? path.join(__dirname, 'index.html') + '#' + error : config.destination);
	}
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	(async () => {
		if(!error){
			try{
				if(!config.destination){
					throw 'No destination defined in config file!';
				}
				if(!await serverOnline(config.destination)){
					// server isn't online, so we should try to start the game
					if(!config.location){
						throw 'The game doesn\'t seem to be running, yet no location for the game has been given.';
					}
					let absLocation = path.resolve(config.location);
					
					try{
						await fs.stat(absLocation);
					}catch(err){
						throw `Failed to find "${absLocation}" ("${config.location}")`;
					}
					try{
						
						child = spawn(['win32', 'win64'].indexOf(process.platform) > -1 ? 'npm.cmd' : 'npm', ['run', 'start:dev'],{
							cwd: absLocation,
						});
						waitingForChild = true;
						child.stdout.on('data', d => {
							if(waitingForChild){
								childStdInBuffer += d.toString();
								waitingForChild = childStdInBuffer.indexOf('localhost') == -1;
							}
						});
						child.stderr.on('data', d => {
							error = 'Error while starting the game: ' + d.toString()
							//child.kill(); // <- that should be enough, but unfortunately we can't be sure...
							kill(child.pid);
						});
					}catch(err){
						throw `Failed to run game! (${err.message?.split('\n')[0] || err})`;
					}
				}
				// else: we assume the game is already running, probably manually started, so we can just continue
			}catch(err){
				error = err;
			}
		}
		
		createWindow();

		// On OS X it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		app.on('activate', () => {
			if (BrowserWindow.getAllWindows().length === 0) {
				createWindow();
			}
		});
	})().then(() => {}).catch(err => console.error);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		if(child){
			try{
				//child.stdin.write('q\n'); // technically the correct way to end the process, but it doesn't seem to work when started with spawn...
				//child.kill(); // doesn't work as we would need to kill at least the "node [...]vite.js[...]" process
				kill(child.pid); // current work around, but not pretty...
			}catch(err){
				console.error(err);
			}
		}
		app.quit();
	}
});

