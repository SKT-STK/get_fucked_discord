mod structs;
use structs::*;
use tauri::{AppHandle, Manager};
use std::{fs::OpenOptions, io::Write};
use serenity::{
  all::{Attachment, ChannelId, CreateAttachment, CreateMessage}, futures::StreamExt, prelude::*
};
use tokio::runtime::Runtime;

const MAIN_CHANNEL: ChannelId = ChannelId::new(1214281535168188489);
const FILES_IDS: ChannelId = ChannelId::new(1216208431250411530);

#[tauri::command]
pub async fn init_bot(app: AppHandle) {
  let token = "MTIxNDI4MTcwNTI3NjU3OTk1MA.G9OeNV.ej-yPMN_j_iyGvdXJLlLbYnPb1wTTFCE6ZTPfs";
  let mut client = Client::builder(token, GatewayIntents::DIRECT_MESSAGES)
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

  let global_context = GLOBAL_CONTEXT.lock().await;
  let http: &serenity::http::Http;
  if let Some(global_context_ref) = (&*global_context).as_ref() {
    http = global_context_ref.http();
  }
  else {
    return 0;
  }

  if is_config {
    send_attachment_config(http, [attachment]).await;
    0
  }
  else {
    send_attachment_data(app, http, [attachment]).await
  }
}

async fn send_attachment_data(app: &AppHandle, http: &serenity::http::Http, attachment: [CreateAttachment; 1]) -> u64 {
  let message_result = MAIN_CHANNEL.send_files(http, attachment, CreateMessage::new()).await;
  app.emit_all("custom-attachment_sent", Payload {}).unwrap();
  message_result.unwrap().id.get()
}

async fn send_attachment_config(http: &serenity::http::Http, attachment: [CreateAttachment; 1]) -> u64 {
  let mut messages = FILES_IDS.messages_iter(http).boxed();
  while let Some(Ok(msg)) = messages.next().await {
    msg.delete(http).await.unwrap();
  }

  let message_result = FILES_IDS.send_files(http, attachment, CreateMessage::new()).await;
  message_result.unwrap().id.get()
}

#[tauri::command]
pub async fn download_attachment(app: AppHandle, file_path: String, ids: Vec<String>) {
  let global_context = GLOBAL_CONTEXT.lock().await;
  let http = &*global_context.as_ref().unwrap().http();

  for id in ids.iter() {
    let message = MAIN_CHANNEL.message(http, id.parse::<u64>().unwrap()).await.unwrap();
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
  let global_context = GLOBAL_CONTEXT.lock().await;
  let http = &*global_context.as_ref().unwrap().http();
  
  for id in ids {
    let _ = MAIN_CHANNEL.delete_message(http, id.parse::<u64>().unwrap()).await;
    app.emit_all("custom-attachment_deleted", Payload {}).unwrap();
  }
}

pub async fn get_config_message_content() -> Vec<u8> {
  let global_context = GLOBAL_CONTEXT.lock().await;
  let http = &*global_context.as_ref().unwrap().http();

  let mut messages = FILES_IDS.messages_iter(http).boxed();
  if let Some(Ok(msg)) = messages.next().await {
    return msg.attachments.get(0).unwrap().download().await.unwrap();
  }
  Vec::new()
}
