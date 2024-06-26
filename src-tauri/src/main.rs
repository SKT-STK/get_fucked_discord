// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod dc_bot;
mod files;
mod window;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      dc_bot::init_bot,
      files::process_file_contents,
      files::get_file_size,
      files::get_starter_data,
      files::write_config_file,
      dc_bot::download_attachment,
      dc_bot::delete_attachments,
      window::show_window
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
