// @ts-ignore
import WindowInfo = cube.windows.WindowInfo;

const showWin =  (win:string) => {
  cube.windows.getWindowByName(win).then((v:WindowInfo) => {
    if (v.show){
      cube.windows.hide(v.id)
    }else {
      cube.windows.show(v.id)
    }
  }).catch(() => {})
}

cube.os.tray.setMenu(
  async (e, ...args) => {
    if ((e == 'item-click'&& args[0]?.id == 'showMain')||e=='click') {
      showWin('main')
    }
    if (e == 'item-click' && args[0]?.id == 'quit') {
      cube.extensions.terminate();
    }
    if (e == 'item-click' && args[0]?.id == 'showAssist') {
      showWin('assist')
    }
  },
  [
    { type: 'normal', label: '显示主页', id: 'showMain'},
    { type: 'normal', label: '显示助手', id: 'showAssist'},
    { type: 'normal', label: '退出软件', id: 'quit' },
  ],
  'Frank',
  'data:image/png;base64,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'
);