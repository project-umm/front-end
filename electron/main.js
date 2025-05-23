import { app, BrowserWindow } from 'electron';
import isDev from 'electron-is-dev';
import { autoUpdater } from 'electron-updater';

const PRODUCTION_URL = 'https://www.project-umm.com';

// 자동 업데이트 설정
function setupAutoUpdater() {
  // 개발 환경에서는 자동 업데이트 비활성화
  if (isDev) {
    return;
  }

  // 업데이트 확인 시작
  autoUpdater.checkForUpdatesAndNotify();

  // 업데이트 다운로드 진행률
  autoUpdater.on('download-progress', progressObj => {
    let message = `다운로드 속도: ${progressObj.bytesPerSecond}`;
    message = `${message} - 다운로드 ${progressObj.percent}%`;
    message = `${message} (${progressObj.transferred}/${progressObj.total})`;
    console.log(message);
  });

  // 업데이트 다운로드 완료
  autoUpdater.on('update-downloaded', () => {
    // 업데이트 설치 및 앱 재시작
    autoUpdater.quitAndInstall();
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // 개발 환경에서는 localhost, 프로덕션 환경에서는 배포 URL 사용
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : PRODUCTION_URL);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();
  setupAutoUpdater();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
