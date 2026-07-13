# 构建与验证报告

验证日期：2026-07-13

## 当前环境

- 操作系统：Linux 容器
- Node.js：22.16.0
- npm：10.9.2
- Rust/Cargo：当前环境未安装
- Microsoft Office：当前环境未安装

## 已实际执行并通过

```text
npm install
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm audit --audit-level=high
```

结果：

- Prettier 格式检查：通过。
- ESLint：通过，0 error。
- TypeScript strict：通过。
- Vitest：9 个测试文件、23 个测试全部通过。
- 生产构建：通过。
- 主界面 JavaScript 包约 241 KB；Word/PPT 依赖已拆为按需加载 chunk。
- DOCX 测试：确认生成非空 ZIP/OOXML，包含 `word/document.xml`、与人数对应的 section，以及 SVG/PNG 媒体。
- PPTX 测试：确认生成非空 ZIP/OOXML，包含 `ppt/presentation.xml`，幻灯片数量与人数一致。
- Tauri `tauri.conf.json`：已按项目安装的 Tauri CLI JSON Schema 校验通过。
- npm 依赖审计：0 个已知漏洞。

## 未在当前环境宣称通过

以下项目必须在带 Rust、Windows MSVC 工具链和 WebView2 的 Windows 环境执行：

```text
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
npm run tauri build
```

已实际尝试执行 `npm run tauri build -- --no-bundle`，Tauri CLI 在调用 `cargo metadata` 时因系统没有 Cargo 而退出；这与环境限制一致。

因此，本交付物不包含伪造的 `.exe`、`.msi`、NSIS 安装包、`Cargo.lock` 或 Cargo 编译成功记录。GitHub Actions Windows 工作流已包含上述完整检查与安装包上传步骤。首次在可联网 Rust 环境构建后应提交生成的 `src-tauri/Cargo.lock`。

## 仍需进行的人工验收

- 在 Windows 10/11 实机打开系统打印对话框并检查不同打印机驱动的分页和 100% 尺寸。
- 用 Microsoft Word 打开导出的 DOCX，检查所选系统字体、SVG 渲染和 PNG fallback。
- 用 Microsoft PowerPoint 打开导出的 PPTX，检查自定义页面尺寸与打印方向。
- 用 100、500 个真实姓名测试导出耗时和内存峰值。
