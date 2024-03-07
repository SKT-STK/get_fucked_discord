mod structs;
use structs::*;
use tauri::{AppHandle, Manager};

use std::{env, fs::OpenOptions, io::Write};
use serenity::{
  all::{Attachment, ChannelId, CreateAttachment, CreateMessage}, prelude::*
};

const MAIN_CHANNEL: ChannelId = ChannelId::new(1214281535168188489);

#[tauri::command]
pub async fn init_bot() {
  let token = env::var("DISCORD_TOKEN").expect("No Discord Bot Token Provided");
  let mut client = Client::builder(&token, GatewayIntents::DIRECT_MESSAGES)
    .event_handler(Handler)
    .await
    .expect("Error creating client");

  if let Err(e) = client.start().await {
    println!("Client error: {}", e);
  }
}

// pub async fn send_message(msg: &str) {
//   let global_context = GLOBAL_CONTEXT.lock().await;
//   let message = MAIN_CHANNEL.say(&*global_context.as_ref().unwrap().http(), msg).await.unwrap();
//   println!("{}", message.id);
// }

pub async fn send_attachment(file_path: &str, app: &AppHandle) -> u64 {
  let attachment = CreateAttachment::path(file_path).await.unwrap();

  let global_context = GLOBAL_CONTEXT.lock().await;
  let message = MAIN_CHANNEL.send_files(
      &*global_context
        .as_ref()
        .unwrap()
        .http(),
      [attachment],
      CreateMessage::new()
    ).await.unwrap();
  app.emit_all("custom-attachment_sent", Payload {}).unwrap();

  message.id.get()
}

#[tauri::command]
pub async fn download_attachment(file_path: String, ids: Vec<String>) {
  let global_context = GLOBAL_CONTEXT.lock().await;
  for id in ids.iter() {
    let message = MAIN_CHANNEL.message(&*global_context.as_ref().unwrap().http(), id.parse::<u64>().unwrap()).await.unwrap();
    process_attachment(message.attachments.get(0).unwrap(), &file_path).await;
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
