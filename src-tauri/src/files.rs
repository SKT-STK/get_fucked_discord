use tauri::AppHandle;

use crate::dc_bot::{self, get_config_message_content, send_attachment};

use std::{env, fs::{self, File, OpenOptions}, io::{Read, Write}, os::windows::fs::MetadataExt};

#[tauri::command]
pub fn get_file_size(path: String) -> u64 {
  let file = File::open(path).unwrap();
  file.metadata().unwrap().file_size()
}

#[tauri::command]
pub async fn write_config_file(app: AppHandle, contents: String) {
  let path = env::temp_dir()
    .to_str()
    .unwrap()
    .to_owned()
    + "/get_fucked_discord_data.json";

  let mut file = OpenOptions::new()
    .write(true)
    .create(true)
    .open(&path)
    .unwrap();

  file.write_all(contents.as_bytes()).unwrap();

  let _ = send_attachment(&path, &app, true).await;

  let _ = fs::remove_file(path);
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

  let mut i: u32 = 0;
  loop {
    i += 1;

    let bytes_read = file.read(&mut buffer[..]).unwrap();
    if bytes_read == 0 { break; }

    ret.push(
      handle_data(&i, &buffer, bytes_read, &app).await.to_string()
    );
  }

  ret
}

async fn handle_data(i: &u32, buffer: &Vec<u8>, bytes_read: usize, app: &AppHandle) -> u64 {
  let path = env::temp_dir()
    .to_str()
    .unwrap()
    .to_owned()
    + "/"
    + &i.to_string()
    + ".25mb";

  let mut file = File::create(&path).unwrap();

  file.write_all(&buffer[..bytes_read]).unwrap();

  let ret = dc_bot::send_attachment(&path, app, false).await;
  let _ = fs::remove_file(path);

  ret
}
