var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},s=(n,r,s)=>(s=n==null?{}:e(i(n)),o(r||!n||!n.__esModule||!a.call(n,`default`)?t(s,`default`,{value:n,enumerable:!0}):s,n));let c=require("electron"),l=require("path"),u=require("fs"),d=require("better-sqlite3");d=s(d);var f=null;function p(){let e=(0,l.join)(process.env.VITE_PUBLIC||(0,l.join)(__dirname,`../../public`),`favicon.svg`),t=c.nativeImage.createFromPath(e);f=new c.Tray(t);let n=c.Menu.buildFromTemplate([{label:`Daily Notch`,enabled:!1},{type:`separator`},{label:`Toggle Focus`,click:()=>{}},{label:`Settings`,click:()=>{}},{type:`separator`},{label:`Quit`,click:()=>{c.app.quit()}}]);return f.setToolTip(`Daily Notch`),f.setContextMenu(n),f}var m;function h(){let e=c.app.getPath(`userData`);(0,u.existsSync)(e)||(0,u.mkdirSync)(e,{recursive:!0});let t=c.app.isPackaged?(0,l.join)(e,`daily-notch.sqlite`):(0,l.join)(process.cwd(),`daily-notch.sqlite`);m=new d.default(t),m.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      estimatedMinutes INTEGER DEFAULT 25,
      date TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      completedAt INTEGER,
      categoryId TEXT
    );
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS activity (
      date TEXT PRIMARY KEY,
      completedCount INTEGER DEFAULT 0
    );
  `);try{m.exec(`ALTER TABLE tasks ADD COLUMN categoryId TEXT;`)}catch{}let n=m.prepare(`SELECT COUNT(*) as count FROM categories`).get();if(!n||n.count===0){let e=m.prepare(`INSERT INTO categories (id, name, color, createdAt) VALUES (?, ?, ?, ?)`),t=Date.now();e.run(`cat-work`,`Work`,`#3B82F6`,t),e.run(`cat-study`,`Study`,`#8B5CF6`,t+1),e.run(`cat-health`,`Health`,`#10B981`,t+2),e.run(`cat-personal`,`Personal`,`#F59E0B`,t+3)}let r=m.prepare(`SELECT value FROM settings WHERE key = ?`);r.get(`streak`)||(m.prepare(`INSERT INTO settings (key, value) VALUES ('streak', '0')`).run(),m.prepare(`INSERT INTO settings (key, value) VALUES ('focusMinutes', '25')`).run()),r.get(`language`)||m.prepare(`INSERT INTO settings (key, value) VALUES ('language', 'en')`).run(),c.ipcMain.handle(`store:getData`,(e,t)=>g(t)),c.ipcMain.handle(`store:addTask`,(e,t)=>b(t)),c.ipcMain.handle(`store:updateTask`,(e,t,n)=>x(t,n)),c.ipcMain.handle(`store:updateTaskOrder`,(e,t)=>C(t)),c.ipcMain.handle(`store:toggleTask`,(e,t)=>w(t)),c.ipcMain.handle(`store:deleteTask`,(e,t)=>E(t)),c.ipcMain.handle(`store:updateSetting`,(e,t,n)=>_(t,n)),c.ipcMain.handle(`store:addCategory`,(e,t)=>v(t)),c.ipcMain.handle(`store:deleteCategory`,(e,t)=>y(t))}function g(e){if(!m)return{tasks:[],activity:[],focusMinutes:25,streak:0,unscheduledCount:0,language:`en`,categories:[],categoryStats:[]};let t=m.prepare(`SELECT * FROM tasks WHERE date = ? ORDER BY createdAt ASC`).all(e).map(e=>({...e,completed:e.completed===1})),n=m.prepare(`SELECT date, completedCount FROM activity ORDER BY date DESC LIMIT 60`).all(),r=m.prepare(`SELECT value FROM settings WHERE key = 'streak'`).get(),i=m.prepare(`SELECT value FROM settings WHERE key = 'focusMinutes'`).get(),a=m.prepare(`SELECT value FROM settings WHERE key = 'language'`).get(),o=m.prepare(`SELECT COUNT(*) as count FROM tasks WHERE date = 'unscheduled'`).get(),s=m.prepare(`SELECT * FROM categories ORDER BY createdAt ASC`).all(),c=m.prepare(`
    SELECT 
      c.id as categoryId,
      c.name,
      c.color,
      COUNT(t.id) as completedCount
    FROM categories c
    LEFT JOIN tasks t ON t.categoryId = c.id AND t.completed = 1
    GROUP BY c.id
    ORDER BY completedCount DESC, c.createdAt ASC
  `).all();return{tasks:t,activity:n,streak:r?parseInt(r.value):0,focusMinutes:i?parseInt(i.value):25,unscheduledCount:o?o.count:0,language:a?a.value:`en`,categories:s,categoryStats:c}}function _(e,t){m.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(e,t)}function v(e){let t={id:`cat-`+Math.random().toString(36).substring(2,9),name:e.name.trim(),color:e.color,createdAt:Date.now()};return m.prepare(`
    INSERT INTO categories (id, name, color, createdAt)
    VALUES (@id, @name, @color, @createdAt)
  `).run(t),t}function y(e){return m.prepare(`UPDATE tasks SET categoryId = NULL WHERE categoryId = ?`).run(e),m.prepare(`DELETE FROM categories WHERE id = ?`).run(e),!0}function b(e){let t={...e,id:Math.random().toString(36).substring(2,9),createdAt:Date.now()};return m.prepare(`
    INSERT INTO tasks (id, title, completed, estimatedMinutes, date, createdAt, categoryId)
    VALUES (@id, @title, @completed, @estimatedMinutes, @date, @createdAt, @categoryId)
  `).run({...t,completed:+!!t.completed,categoryId:t.categoryId||null}),t}function x(e,t){if(!m.prepare(`SELECT * FROM tasks WHERE id = ?`).get(e))return null;t.estimatedMinutes!==void 0&&m.prepare(`UPDATE tasks SET estimatedMinutes = ? WHERE id = ?`).run(t.estimatedMinutes,e),t.title!==void 0&&m.prepare(`UPDATE tasks SET title = ? WHERE id = ?`).run(t.title,e),t.categoryId!==void 0&&m.prepare(`UPDATE tasks SET categoryId = ? WHERE id = ?`).run(t.categoryId,e);let n=m.prepare(`SELECT * FROM tasks WHERE id = ?`).get(e);return{...n,completed:n.completed===1}}function S(e){if(!m)return null;let t=m.prepare(`SELECT * FROM tasks WHERE id = ?`).get(e);return t?{...t,completed:t.completed===1}:null}function C(e){let t=Date.now(),n=m.prepare(`UPDATE tasks SET createdAt = ? WHERE id = ?`);m.transaction(e=>{e.forEach((e,r)=>{n.run(t+r,e)})})(e)}function w(e){let t=m.prepare(`SELECT * FROM tasks WHERE id = ?`).get(e);if(!t)return null;let n=t.completed!==1;m.prepare(`UPDATE tasks SET completed = ?, completedAt = ? WHERE id = ?`).run(+!!n,n?Date.now():null,e);let r=t.date;n?m.prepare(`
      INSERT INTO activity (date, completedCount) VALUES (?, 1)
      ON CONFLICT(date) DO UPDATE SET completedCount = completedCount + 1
    `).run(r):m.prepare(`
      UPDATE activity SET completedCount = MAX(0, completedCount - 1) WHERE date = ?
    `).run(r);let i=m.prepare(`SELECT * FROM tasks WHERE id = ?`).get(e);return{...i,completed:i.completed===1}}function T(e){let t=m.prepare(`SELECT * FROM tasks WHERE id = ?`).get(e);return!t||t.completed===1?null:(m.prepare(`UPDATE tasks SET completed = 1, completedAt = ? WHERE id = ?`).run(Date.now(),e),m.prepare(`
    INSERT INTO activity (date, completedCount) VALUES (?, 1)
    ON CONFLICT(date) DO UPDATE SET completedCount = completedCount + 1
  `).run(t.date),{...m.prepare(`SELECT * FROM tasks WHERE id = ?`).get(e),completed:!0})}function E(e){let t=m.prepare(`SELECT * FROM tasks WHERE id = ?`).get(e);return t?(t.completed===1&&m.prepare(`UPDATE activity SET completedCount = MAX(0, completedCount - 1) WHERE date = ?`).run(t.date),m.prepare(`DELETE FROM tasks WHERE id = ?`).run(e),!0):!1}var D=null,O=0,k=0,A=!1,j=null;function M(){c.ipcMain.handle(`timer:start`,(e,t,n)=>N(t,n)),c.ipcMain.handle(`timer:stop`,()=>P()),c.ipcMain.handle(`timer:status`,()=>({isRunning:A,timeRemaining:O,totalTime:k,taskId:j,task:j?S(j):null}))}function N(e,t){A||(j=e,O=t*60,k=t*60,A=!0,D=setInterval(()=>{k===0?(O+=1,F()):O>0?(--O,F()):(j&&(T(j),c.BrowserWindow.getAllWindows().forEach(e=>{e.webContents.send(`timer:finished`,j)})),P(),I(`Focus Session Complete!`,`Great job staying focused.`))},1e3))}function P(){D&&clearInterval(D),D=null,A=!1,O=0,k=0,j=null,F()}function F(){let e=j?S(j):null,t={isRunning:A,timeRemaining:O,totalTime:k,taskId:j,task:e};c.BrowserWindow.getAllWindows().forEach(e=>{e.webContents.send(`timer:tick`,t)})}function I(e,t){c.Notification.isSupported()&&new c.Notification({title:e,body:t}).show()}var L=!1;function R(){c.app.whenReady().then(()=>{c.globalShortcut.register(`CommandOrControl+Shift+Space`,()=>{L?(P(),L=!1):(N(``,25),L=!0)})})}function z(){c.globalShortcut.unregisterAll()}process.env.DIST_ELECTRON=(0,l.join)(__dirname,`../`),process.env.DIST=(0,l.join)(process.env.DIST_ELECTRON,`../dist`),process.env.VITE_PUBLIC=process.env.VITE_DEV_SERVER_URL?(0,l.join)(process.env.DIST_ELECTRON,`../public`):process.env.DIST;var B=null;function V(){let{screen:e}=require("electron"),{width:t}=e.getPrimaryDisplay().workAreaSize;B=new c.BrowserWindow({width:320,height:120,x:Math.floor(t/2-160),y:0,frame:!1,transparent:!0,alwaysOnTop:!0,skipTaskbar:!0,webPreferences:{preload:(0,l.join)(__dirname,`../preload/index.cjs`)}});let n=process.env.VITE_DEV_SERVER_URL;n?B.loadURL(`${n}src/renderer/index.html`):B.loadFile((0,l.join)(process.env.DIST||``,`src/renderer/index.html`))}c.app.whenReady().then(()=>{h(),M(),R(),V(),p(),c.ipcMain.on(`window:resize`,(e,t)=>{let n=c.BrowserWindow.fromWebContents(e.sender);if(!n)return;let{screen:r}=require("electron"),{width:i}=r.getPrimaryDisplay().workAreaSize,a=800,o=600;t===`collapsed`?(a=320,o=120):t===`hovered`?(a=600,o=360):t===`expanded`&&(a=800,o=620),n.setBounds({x:Math.floor(i/2-a/2),y:0,width:a,height:o})})}),c.app.on(`window-all-closed`,()=>{z(),process.platform!==`darwin`&&c.app.quit()}),c.app.on(`will-quit`,()=>{z()}),c.app.on(`activate`,()=>{c.BrowserWindow.getAllWindows().length===0&&V()});