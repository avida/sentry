// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {

	onControllerData: (cb: (data: any) => void) => {
		const handler = (_: any, data: any) => cb(data);
		ipcRenderer.on('controller-data', handler);
		return () => {
			ipcRenderer.removeListener('controller-data', handler);
		};
	},

	sendShift: (value: number) => {
		return ipcRenderer.invoke('serial-sendShift', value);
	},
});
