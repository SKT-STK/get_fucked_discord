use futures::{stream::FuturesOrdered, StreamExt};
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
  const CHUNK_NUMBER: usize = 5;

  let mut ret = Vec::new();

  let mut file = File::open(file_path).unwrap();
  file.metadata().unwrap().file_size();
  let mut buffer = vec![0; CHUCK_SIZE];

  loop {
    let mut futures = FuturesOrdered::new();

    let mut do_break = false;
    for _ in 0..CHUNK_NUMBER {
      let bytes_read = file.read(&mut buffer[..]).unwrap();
      if bytes_read == 0 { do_break = true; break; }

      let app_clone = app.clone();
      let buffer_clone = buffer[..bytes_read].to_vec();
      let future = async move {
        send_attachment(buffer_clone, &app_clone, false).await.to_string()
      };
      futures.push_back(future);
    }

    while let Some(id) = futures.next().await {
      ret.push(id);
    }

    if do_break { break; }
  }

  ret
}
