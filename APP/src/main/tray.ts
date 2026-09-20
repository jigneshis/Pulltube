import { Tray, Menu, app, BrowserWindow, nativeImage, Notification } from 'electron';
import * as path from 'path';
import { appStore } from './store';
import { IPC_CHANNELS } from '../shared/constants';

let tray: Tray | null = null;
let mainWindowRef: BrowserWindow | null = null;

export function setupTray(mainWindow: BrowserWindow): void {
  mainWindowRef = mainWindow;
  const isPackaged = app.isPackaged;
  // Use a generic icon or path depending on platform. Assuming an icon exists in resources
  const iconPath = isPackaged 
    ? path.join(process.resourcesPath, '..', 'build', 'icon.ico')
    : path.join(__dirname, '../../build/icon.ico');
    
  let trayIcon: Electron.NativeImage;
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      trayIcon = nativeImage.createFromPath(path.join(__dirname, '../../build/icon.ico'));
    }
  } catch (e) {
    trayIcon = nativeImage.createEmpty();
  }

  if (trayIcon.isEmpty()) {
    return; // Don't crash Windows Shell_NotifyIcon if icon file is missing
  }

  tray = new Tray(trayIcon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show PullTube',
      click: () => {
        mainWindow.show();
        if (mainWindow.isMinimized()) mainWindow.restore();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('PullTube Downloader');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      if (mainWindow.isFocused()) {
        mainWindow.hide();
      } else {
        mainWindow.focus();
      }
    } else {
      mainWindow.show();
    }
  });
}

export function updateTrayTooltip(text: string) {
  if (tray) {
    tray.setToolTip(text);
  }
}

export function showNotification(title: string, body: string, onClick?: () => void) {
  const settings = appStore.getSettings();
  if (settings.notificationsEnabled && Notification.isSupported()) {
    const isPackaged = app.isPackaged;
    const iconPath = isPackaged 
      ? path.join(process.resourcesPath, '..', 'build', 'icon.ico')
      : path.join(__dirname, '../../build/icon.ico');

    const notification = new Notification({
      title,
      body,
      silent: true, // Custom sound is handled via app audio engine
      icon: iconPath,
    });

    notification.on('click', () => {
      if (onClick) {
        onClick();
      } else if (mainWindowRef && !mainWindowRef.isDestroyed()) {
        if (mainWindowRef.isMinimized()) mainWindowRef.restore();
        mainWindowRef.show();
        mainWindowRef.focus();
        mainWindowRef.webContents.send(IPC_CHANNELS.NAVIGATE_TO, '/downloads');
      }
    });

    notification.show();
  }
}
