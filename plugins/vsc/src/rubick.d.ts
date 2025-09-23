// 基础类型：对齐官方文档的核心数据结构
interface PluginContext {
  /** plugin.json 中定义的功能标识 */
  code: string;
  /** 触发插件的输入类型 */
  type: 'text' | 'img' | 'files' | 'regex' | 'over' | 'window';
  /** 不同类型对应的载荷数据 */
  payload:
    | string // text/regex/over 类型：文本内容或空值
    | string // img 类型：图片Base64编码字符串
    | FileInfo[] // files 类型：选中的文件列表
    | Record<string, any>; // window 类型：自定义窗口参数
}

interface FileInfo {
  /** 是否为文件 */
  isFile: boolean;
  /** 是否为文件夹 */
  isDirectory: boolean;
  /** 文件名（含后缀） */
  name: string;
  /** 文件绝对路径 */
  path: string;
}

/** 数据库文档结构（基于PouchDB，官方底层依赖） */
interface DBDocument {
  /** 文档唯一ID */
  _id: string;
  /** 文档版本号（更新/删除时必需） */
  _rev?: string;
  /** 自定义数据字段（插件可自由扩展） */
  [key: string]: any;
}

// 对话框选项类型：补充Electron原生参数约束
interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  /** 文件筛选规则 */
  filters?: Array<{ name: string; extensions: string[] }>;
  /** 对话框功能属性 */
  properties?: Array<
    'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory'
  >;
}

interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}

// 窗口创建参数：结合Rubick插件路径逻辑与Electron配置
interface BrowserWindowCreateOptions {
  /** 插件名称（用于定位插件目录） */
  name: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  useContentSize?: boolean;
  resizable?: boolean;
  title?: string;
  show?: boolean;
  backgroundColor?: string;
  webPreferences?: {
    webSecurity?: boolean;
    backgroundThrottling?: boolean;
    contextIsolation?: boolean;
    webviewTag?: boolean;
    nodeIntegration?: boolean;
    spellcheck?: boolean;
    partition?: string | null;
    /** 预加载脚本路径（相对于插件根目录） */
    preload?: string;
  };
}

type AppPathName =
  | 'home'
  | 'appData'
  | 'userData'
  | 'sessionData'
  | 'temp'
  | 'exe'
  | 'module'
  | 'desktop'
  | 'documents'
  | 'downloads'
  | 'music'
  | 'pictures'
  | 'videos'
  | 'logs'
  | 'crashDumps'
  | 'recent';

/** Electron BrowserWindow 简化类型（Rubick暴露的核心方法） */
interface RubickBrowserWindow {
  loadURL(url: string): void;
  on(event: 'closed' | 'ready-to-show', listener: (...args: any[]) => void): void;
  once(event: 'ready-to-show', listener: (...args: any[]) => void): void;
  show(): void;
  close(): void;
  webContents: {
    on(event: 'dom-ready', listener: (...args: any[]) => void): void;
  };
}

// 屏幕相关类型：对齐Electron screen模块
interface Point {
  x: number;
  y: number;
}

interface Display {
  id: number;
  /** 显示器边界（含任务栏等系统区域） */
  bounds: { x: number; y: number; width: number; height: number };
  /** 显示器工作区（不含系统区域） */
  workArea: { x: number; y: number; width: number; height: number };
  /** 显示缩放比例 */
  scaleFactor: number;
  rotation: number;
  touchSupport: 'available' | 'unavailable' | 'unknown';
}

// 钩子函数类型：统一管理插件生命周期回调
interface RubickHooks {
  onPluginEnter?: (context: PluginContext) => void;
  onPluginReady?: (context: PluginContext) => void;
  onPluginOut?: () => void;
  onSubInputChange?: (param: { text: string }) => void;
  onScreenCapture?: (data: { data: string }) => void;
}

// 核心API接口：整合所有方法并修正类型
interface Rubick {
  hooks: RubickHooks;
  __event__: Record<string, Array<(...args: any[]) => void>>;

  // ------------------------------
  // 插件生命周期事件（官方文档明确参数）
  // ------------------------------
  /** 插件进入视野时触发 */
  onPluginEnter(cb: (context: PluginContext) => void): void;
  /** 插件初始化完成时触发（含输入上下文） */
  onPluginReady(cb: (context: PluginContext) => void): void;
  /** 插件退出时触发 */
  onPluginOut(cb: () => void): void;

  // ------------------------------
  // 插件操作
  // ------------------------------
  /** 打开指定插件 */
  openPlugin(plugin: { code: string; [key: string]: any }): void;
  /** 移除当前插件 */
  removePlugin(): void;
  /** 退出当前插件（同removePlugin） */
  outPlugin(): void;

  // ------------------------------
  // 窗口交互（修正返回值与参数类型）
  // ------------------------------
  /** 隐藏Rubick主窗口 */
  hideMainWindow(): void;
  /** 显示Rubick主窗口 */
  showMainWindow(): void;
  /** 显示文件选择对话框 */
  showOpenDialog(options: OpenDialogOptions = {}): string[] | undefined;
  /** 显示文件保存对话框 */
  showSaveDialog(options: SaveDialogOptions): string | undefined;
  /** 设置插件扩展区域高度（返回操作结果） */
  setExpendHeight(height: number): boolean;
  /** 设置子输入框（回调接收输入文本） */
  setSubInput(
    onChange: (param: { text: string }) => void,
    placeholder?: string,
    isFocus?: boolean,
  ): boolean;
  /** 移除子输入框 */
  removeSubInput(): void;
  /** 设置子输入框内容 */
  setSubInputValue(text: string): boolean;
  /** 子输入框失焦 */
  subInputBlur(): void;
  /** 获取系统路径（如userData、desktop等，对齐Electron AppPath） */
  getPath(name: AppPathName): string;
  /** 显示系统通知（clickFeatureCode为点击后触发的功能标识） */
  showNotification(body: string, clickFeatureCode?: string): void;

  // ------------------------------
  // 复制操作
  // ------------------------------
  /** 复制图片到剪贴板（img为Base64字符串） */
  copyImage(img: string): boolean;
  /** 复制文本到剪贴板 */
  copyText(text: string): boolean;
  /** 复制文件到剪贴板（file为文件绝对路径） */
  copyFile(file: string): boolean;

  // ------------------------------
  // 数据库操作（精确返回值类型）
  // ------------------------------
  db: {
    /** 新增/更新文档（返回文档ID与版本） */
    put(data: DBDocument): Promise<{ id: string; ok: boolean; rev: string }>;
    /** 根据ID获取文档（不存在时返回null） */
    get(id: string): Promise<DBDocument | null>;
    /** 删除文档（需传入_id与_rev） */
    remove(doc: DBDocument): Promise<{ id: string; ok: boolean; rev: string }>;
    /** 批量新增/更新文档 */
    bulkDocs(docs: DBDocument[]): Promise<Array<{ id: string; ok: boolean; rev: string }>>;
    /** 获取所有文档（key为筛选条件，可选） */
    allDocs(key?: string | string[]): Promise<DBDocument[]>;
    /** 为文档添加附件（如图片、文件） */
    postAttachment(docId: string, attachment: Blob | string, type: string): Promise<void>;
    /** 获取文档附件 */
    getAttachment(docId: string): Promise<Blob | string | null>;
    /** 获取文档附件的MIME类型 */
    getAttachmentType(docId: string): Promise<string | null>;
  };

  /** 简化版本地存储（基于db封装，key-value结构） */
  dbStorage: {
    setItem(key: string, value: any): void;
    getItem(key: string): any | null;
    removeItem(key: string): void;
  };

  // ------------------------------
  // 主题与功能管理
  // ------------------------------
  /** 判断当前是否为深色模式（当前版本固定返回false，预留扩展） */
  isDarkColors(): boolean;
  /** 获取所有已注册功能 */
  getFeatures(): Array<{ code: string; [key: string]: any }>;
  /** 注册新功能 */
  setFeature(feature: { code: string; [key: string]: any }): boolean;
  /** 根据code移除功能 */
  removeFeature(code: string): boolean;

  // ------------------------------
  // 屏幕捕获
  // ------------------------------
  /** 触发屏幕捕获（回调接收捕获结果Base64） */
  screenCapture(cb: (data: string) => void): void;

  // ------------------------------
  // 系统与工具方法
  // ------------------------------
  /** 用默认浏览器打开外部链接 */
  shellOpenExternal(url: string): void;
  /** 判断是否为macOS系统 */
  isMacOs(): boolean;
  /** 判断是否为Windows系统 */
  isWindows(): boolean;
  /** 判断是否为Linux系统 */
  isLinux(): boolean;
  /** 用系统默认程序打开路径（文件/文件夹） */
  shellOpenPath(path: string): void;
  /** 获取本地设备唯一标识 */
  getLocalId(): string;
  /** 在文件管理器中显示指定路径的文件 */
  shellShowItemInFolder(path: string): void;
  /** 功能跳转（预留接口，暂未实现） */
  redirect(label: string, payload?: Record<string, any>): void;
  /** 播放系统提示音 */
  shellBeep(): void;
  /** 获取文件图标（返回Base64字符串） */
  getFileIcon(path: string): string;
  /** 获取剪贴板中的文件列表 */
  getCopyedFiles(): FileInfo[];
  /** 模拟键盘按键（modifier为组合键，如Ctrl、Shift） */
  simulateKeyboardTap(key: string, ...modifier: Array<'Ctrl' | 'Shift' | 'Alt' | 'Meta'>): void;
  /** 获取鼠标当前屏幕坐标 */
  getCursorScreenPoint(): Point;
  /** 获取鼠标所在的显示器信息 */
  getDisplayNearestPoint(point: Point): Display;

  // ------------------------------
  // 窗口创建（基于插件目录的窗口管理）
  // ------------------------------
  /** 创建新窗口（url为插件内页面路径，基于插件根目录） */
  createBrowserWindow(
    url: string,
    options: BrowserWindowCreateOptions,
    callback?: () => void,
  ): RubickBrowserWindow;
}

// 全局声明：允许在window上直接访问rubick
declare global {
  let rubick: Rubick;
}

export default Rubick;
