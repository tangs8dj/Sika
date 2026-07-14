mod fonts;

use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::Manager;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};

const EXPIRATION_TIMESTAMP: u64 = 1_785_542_400;

#[tauri::command]
fn print_current_window(
    window: tauri::WebviewWindow,
    width_mm: f64,
    height_mm: f64,
) -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    {
        use std::sync::mpsc::sync_channel;

        use objc2_app_kit::NSPrintInfo;
        use objc2_foundation::NSSize;
        use objc2_web_kit::WKWebView;

        let (sender, receiver) = sync_channel(1);
        window
            .with_webview(move |webview| {
                let printed = unsafe {
                    let webview: &WKWebView = &*webview.inner().cast();
                    let print_info = NSPrintInfo::sharedPrintInfo();
                    print_info.setPaperSize(NSSize::new(
                        width_mm * 72.0 / 25.4,
                        height_mm * 72.0 / 25.4,
                    ));
                    print_info.setTopMargin(0.0);
                    print_info.setRightMargin(0.0);
                    print_info.setBottomMargin(0.0);
                    print_info.setLeftMargin(0.0);
                    let print_operation = webview.printOperationWithPrintInfo(&print_info);
                    print_operation.runOperation()
                };
                let _ = sender.send(printed);
            })
            .map_err(|error| error.to_string())?;
        let _ = receiver.recv().map_err(|error| error.to_string())?;
        Ok(true)
    }

    #[cfg(not(target_os = "macos"))]
    {
        let _ = window;
        let _ = width_mm;
        let _ = height_mm;
        Ok(false)
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            fonts::list_system_fonts,
            print_current_window
        ])
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
