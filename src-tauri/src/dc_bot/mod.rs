mod structs;
use serde::Deserialize;
use structs::*;
use tauri::{AppHandle, Manager};
use std::{fs::{File, OpenOptions}, io::{Read, Write}};
use serenity::{
  all::{Attachment, ChannelId, CreateAttachment, CreateMessage}, futures::StreamExt, prelude::*, http::Http
};
use tokio::runtime::Runtime;

// const MAIN_CHANNEL: ChannelId = ChannelId::new(1214281535168188489);
// const FILES_IDS: ChannelId = ChannelId::new(1216208431250411530);
// const TOKEN: &str = "MTIxNDI4MTcwNTI3NjU3OTk1MA.G9OeNV.ej-yPMN_j_iyGvdXJLlLbYnPb1wTTFCE6ZTPfs";
static mut MAIN_CHANNEL: ChannelId = ChannelId::new(1);
static mut FILES_IDS: ChannelId = ChannelId::new(1);
static mut TOKEN: String = String::new();

fn get_static_main_channel() -> ChannelId {
  unsafe { MAIN_CHANNEL }
}
fn get_static_files_ids() -> ChannelId {
  unsafe { FILES_IDS }
}
fn get_static_token<'a>() -> &'a str {
  unsafe { TOKEN.as_str() }
}

#[derive(Deserialize)]
struct ConfigValues {
  discord_bot_token: String,
  main_upload_channel_id: u64,
  file_ids_channel_id: u64,
}

fn get_config_values() -> ConfigValues {
  let mut file = File::open(format!("{}\\config.json", std::env::current_exe().unwrap().to_str().unwrap().to_string().chars().rev().collect::<String>().split_once("\\").unwrap().1.chars().rev().collect::<String>())).unwrap();
  let mut contents = String::new();
  file.read_to_string(&mut contents).unwrap();

  serde_json::from_str(&contents).unwrap()
}

#[tauri::command]
pub async fn init_bot(app: AppHandle) {
  let conf = get_config_values();
  unsafe {
    MAIN_CHANNEL = ChannelId::new(conf.main_upload_channel_id);
    FILES_IDS = ChannelId::new(conf.file_ids_channel_id);
    TOKEN = conf.discord_bot_token;
  };

  let mut client = Client::builder(get_static_token(), GatewayIntents::GUILD_MESSAGES)
    .event_handler(Handler)
    .await
    .expect("Error creating client");

  let rt = Runtime::new().unwrap();
  rt.spawn(async move {
    loop {
      if *IS_BOT_READY.lock().await {
        app.emit_all("custom_bot-ready", Payload {}).unwrap();
        break;
      }
    }
  });

  if let Err(e) = client.start().await {
    println!("Client error: {}", e);
  }
}

pub async fn send_attachment(file: impl Into<Vec<u8>>, app: &AppHandle, is_config: bool) -> u64 {
  let attachment = CreateAttachment::bytes(file, ".25mb");

  let http = Http::new(get_static_token());

  if is_config {
    send_attachment_config(&http, [attachment]).await;
    0
  }
  else {
    send_attachment_data(app, &http, [attachment]).await
  }
}

async fn send_attachment_data(app: &AppHandle, http: &Http, attachment: [CreateAttachment; 1]) -> u64 {
  let message_result = get_static_main_channel().send_files(http, attachment, CreateMessage::new()).await;
  app.emit_all("custom-attachment_sent", Payload {}).unwrap();
  message_result.unwrap().id.get()
}

async fn send_attachment_config(http: &Http, attachment: [CreateAttachment; 1]) -> u64 {
  let mut messages = get_static_files_ids().messages_iter(http).boxed();
  while let Some(Ok(msg)) = messages.next().await {
    let _ = msg.delete(http).await;
  }

  let message_result = get_static_files_ids().send_files(http, attachment, CreateMessage::new()).await;
  message_result.unwrap().id.get()
}

#[tauri::command]
pub async fn download_attachment(app: AppHandle, file_path: String, ids: Vec<String>) {
  let http = Http::new(get_static_token());

  for id in ids.iter() {
    let message = get_static_main_channel().message(&http, id.parse::<u64>().unwrap()).await.unwrap();
    process_attachment(message.attachments.get(0).unwrap(), &file_path).await;
    app.emit_all("custom-attachment_downloaded", Payload {}).unwrap();
  }
}

async fn process_attachment(attachment: &Attachment, file_path: &str) {
  let mut file = OpenOptions::new()
    .append(true)
    .create(true)
    .open(file_path)
    .unwrap();

  let content = attachment.download().await.unwrap();

  file.write_all(&content).unwrap();
}

#[tauri::command]
pub async fn delete_attachments(app: AppHandle, ids: Vec<String>) {
  let http = Http::new(get_static_token());
  
  for id in ids {
    let _ = get_static_main_channel().delete_message(&http, id.parse::<u64>().unwrap()).await;
    app.emit_all("custom-attachment_deleted", Payload {}).unwrap();
  }
}

pub async fn get_config_message_content() -> Vec<u8> {
  let http = Http::new(get_static_token());

  let mut messages = get_static_files_ids().messages_iter(http).boxed();
  if let Some(Ok(msg)) = messages.next().await {
    return msg.attachments.get(0).unwrap().download().await.unwrap();
  }
  Vec::new()
}
