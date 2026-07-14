# 批量席卡生成

一个面向 Windows 10/11 的离线桌面工具：批量粘贴姓名，统一设置字体、字号和颜色，实时预览折叠双面或平面单面席卡，然后直接打印或导出 `.docx` / `.pptx`。

## 已实现功能

- 批量姓名输入：支持逐行输入、Excel 多列粘贴时读取每行第一个非空单元格、空行过滤、重名保留和主动去重。
- 名单管理：编辑、删除、启用/停用、全选、取消全选、上下排序；长列表使用窗口化渲染。
- 姓名排版：字体、颜色、字号、最小字号、字重、字间距、水平对齐和最多两行。
- 长姓名适配：文本测量、二分查找缩小字号、两行拆分；达到最小字号仍放不下时给出警告。
- 页面设置：A4、A3、Letter、自定义尺寸，横向/纵向，四边边距，背景、边框、折叠线和安全区。
- 两种布局：默认 A4 横向折叠双面；上半区文字旋转 180°，下半区保持正向；另有平面单面模式。
- 统一排版引擎：预览、打印、SVG、Word 和 PowerPoint 共用毫米坐标场景，避免不同输出方式各算一套位置。
- 打印：独立打印 DOM、动态 `@page`、一人一页、隐藏编辑界面、保留背景色并避免尾部空白页。
- Word：真实 OOXML `.docx`，一人一个 section；每页嵌入 SVG，并附 PNG fallback。
- PowerPoint：真实 OOXML `.pptx`，一人一张自定义尺寸幻灯片，全幅 SVG 保真输出。
- Windows 系统字体：Rust 侧通过 `fontdb` 枚举字体族；失败时自动使用内置中英文字体列表。
- 本地恢复：姓名、样式、页面设置和输出范围自动防抖保存；损坏或旧版本数据会安全回退。
- 任务保护：打印/导出互斥、按钮禁用、实际阶段进度、取消保存不报错、中文 Toast 提示。
- Tauri 最小权限：仅允许保存对话框和对用户选定文件的写入，不启用 shell 或远程网页。

## 技术栈

- Tauri 2 + Rust
- React 19 + TypeScript strict + Vite
- Zustand
- `docx`、PptxGenJS
- Vitest、React Testing Library

## 目录结构

```text
src/
  app/                      主界面和全局样式
  components/               三栏桌面组件、工具栏、状态栏、提示和进度
  features/
    names/                   姓名解析和数据类型
    layout/                  纸张预设、自动适配、统一场景与排版引擎
    preview/                 SVG 屏幕预览
    print/                   独立打印 DOM 和打印样式
    export/                  SVG/PNG、DOCX、PPTX 和文件保存
  hooks/                     Windows 字体调用
  store/                     Zustand 状态及本地持久化
  tests/                     单元、组件和 OOXML 完整性测试
  utils/                     单位换算、校验、文件名和错误处理
src-tauri/
  src/fonts.rs               系统字体枚举命令
  src/lib.rs                 Tauri 插件和命令注册
  capabilities/default.json  最小权限
  tauri.conf.json            窗口、CSP 和 Windows 打包配置
.github/workflows/
  windows-build.yml          Windows CI 和 NSIS/MSI 构建
```

## Windows 开发环境

安装：

1. Node.js 22 LTS 或兼容版本。
2. Rust stable（MSVC toolchain）。
3. Visual Studio Build Tools，勾选“使用 C++ 的桌面开发”。
4. WebView2 Runtime。Windows 10/11 机器通常已有；项目安装器配置为缺失时使用 bootstrapper。

## 安装与运行

```bash
npm ci
npm run tauri dev
```

仅运行浏览器前端，便于 UI 开发：

```bash
npm run dev
```

浏览器模式下 Word/PPT 会使用浏览器下载；Tauri 模式下使用 Windows 原生保存对话框。

## 质量检查

```bash
npm run lint
npm run typecheck
npm run test
npm run format:check
npm run build
```

Rust 环境中再运行：

```bash
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
```

## Windows 打包

```bash
npm run tauri build
```

配置会同时尝试生成 NSIS 和 MSI。成功后通常位于：

```text
src-tauri/target/release/bundle/nsis/
src-tauri/target/release/bundle/msi/
```

项目也提供 `.github/workflows/windows-build.yml`，可在 GitHub Actions 的 Windows runner 上执行完整检查并上传安装包。

首次在 Rust 可联网环境构建时，Cargo 会生成 `src-tauri/Cargo.lock`。建议把它提交到版本控制，以固定桌面端依赖解析结果。

## 使用方法

1. 在左侧粘贴姓名并点击“解析姓名”。
2. 在名单中编辑、排序或取消勾选不需要输出的人员。
3. 在右侧设置文字、页面和折叠方式。
4. 在中间逐页核对实时预览。
5. 顶部选择打印、导出 Word 或导出 PowerPoint。
6. 输出范围可设为全部人员或仅已勾选人员。

## 排版与输出说明

所有几何尺寸在排版层统一使用毫米。场景节点只有文字、线和矩形，渲染器将同一场景转换为屏幕 SVG、打印 SVG、DOCX 页面或 PPTX 幻灯片。

Word 使用整页 SVG，并生成 PNG fallback。这样优先保证版式、旋转和颜色一致，而不是让 Word 内文字可直接编辑。PowerPoint 默认同样采用整页 SVG 高保真模式。

导出文件不会嵌入商业字体文件。目标电脑或打印电脑缺少所选字体时，Office 或系统可能进行字体替换；需要绝对固定视觉效果时，应使用常见字体，并以 PNG fallback/打印结果为准。

## 常见问题

### 打印尺寸不对

在 Windows 打印对话框中选择“实际大小”或 100%，关闭“适应页面”等二次缩放选项，并确认打印机支持当前纸张。

### 导出时提示文件被占用

关闭正在 Word 或 PowerPoint 中打开的同名文件，再重新保存到该位置。

### 系统字体列表只有少量字体

字体枚举失败时会启用内置列表，软件仍可工作。检查 Windows 字体目录权限，然后重启应用。

### 超长姓名仍有警告

降低最小字号、减少页面边距、改用横向纸张，或允许两行。软件不会静默裁掉文字。

## 当前验证状态

详见 [`BUILD_REPORT.md`](./BUILD_REPORT.md)。当前交付环境已实际通过前端 TypeScript、lint、Vitest、生产构建和 OOXML 包结构测试；由于该环境没有 Rust/Cargo 且无法连接 Rust 包源，未在本机声称完成 Tauri Rust 编译或 Windows 安装包生成。Windows CI 已配置用于完成这些检查。

## 许可证

MIT，见 [`LICENSE`](./LICENSE)。
