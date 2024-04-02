use tauri::AppHandle;

use crate::dc_bot::{get_config_message_content, send_attachment};

use std::{fs::File, io::Read, os::windows::fs::MetadataExt};

#[tauri::command]
pub fn get_file_size(path: String) -> u64 {
  let file = File::open(path).unwrap();
  file.metadata().unwrap().file_size()
}

#[tauri::command]
pub async fn write_config_file(app: AppHandle, contents: String) {
  let _ = send_attachment(contents.as_bytes(), &app, true).await;
}

#[tauri::command]
pub async fn get_starter_data() -> String {
  let vec = get_config_message_content().await;
  String::from_utf8(vec).unwrap()
}

#[tauri::command]
pub async fn process_file_contents(app: AppHandle, file_path: String) -> Vec<String>  {
  const CHUCK_SIZE: usize = 25 * 1024 * 1024;

  let mut ret = Vec::new();

  let mut file = File::open(file_path).unwrap();
  file.metadata().unwrap().file_size();
  let mut buffer = vec![0; CHUCK_SIZE];

  loop {
    let bytes_read = file.read(&mut buffer[..]).unwrap();
    if bytes_read == 0 { break; }

    ret.push(
      send_attachment(&buffer[..bytes_read], &app, false).await.to_string()
    );
  }

  ret
}
