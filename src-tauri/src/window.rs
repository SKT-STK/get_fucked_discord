use tauri::Window;

#[tauri::command]
pub fn show_window(win: Window) {
  win.show().unwrap();
}
