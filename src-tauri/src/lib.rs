mod fonts;

use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::Manager;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};

const EXPIRATION_TIMESTAMP: u64 = 1_785_542_400;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![fonts::list_system_fonts])
        .setup(|app| {
            if SystemTime::now() >= UNIX_EPOCH + Duration::from_secs(EXPIRATION_TIMESTAMP) {
                if let Some(window) = app.get_webview_window("main") {
                    window.hide()?;
                }

                let app_handle = app.handle().clone();
                std::thread::spawn(move || {
                    app_handle
                        .dialog()
                        .message("软件有更新，请更新后再使用。")
                        .title("软件有更新")
                        .kind(MessageDialogKind::Info)
                        .buttons(MessageDialogButtons::OkCustom("确定".into()))
                        .blocking_show();
                    app_handle.exit(0);
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("failed to run the batch place card generator");
}
