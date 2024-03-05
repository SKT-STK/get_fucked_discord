// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{env, sync::Arc};
use lazy_static::lazy_static;
use serenity::{
  all::ChannelId,
  async_trait,
  model::gateway::Ready,
  prelude::*
};
use tokio::{fs::File, io::{AsyncReadExt, BufReader}};

const MAIN_CHANNEL: ChannelId = ChannelId::new(1214281535168188489);

lazy_static! {
  static ref GLOBAL_CONTEXT: Arc<Mutex<Option<Context>>> = Arc::new(Mutex::new(None));
}

struct Handler;
#[async_trait]
impl EventHandler for Handler {
  async fn ready(&self, ctx: Context, ready: Ready) {
    println!("{} is ready", ready.user.name);
    let mut global_context = GLOBAL_CONTEXT.lock().await;
    *global_context = Some(ctx);
  }
}

async fn send_message(msg: &str) {
  let global_context = GLOBAL_CONTEXT.lock().await;
  let message = MAIN_CHANNEL.say(&*global_context.as_ref().unwrap().http(), msg).await.unwrap();
  println!("{}", message.id);
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![init_bot, get_file_contents])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
async fn init_bot() {
  let token = env::var("DISCORD_TOKEN").expect("No Discord Bot Token Provided");
  let mut client = Client::builder(&token, GatewayIntents::DIRECT_MESSAGES)
    .event_handler(Handler)
    .await
    .expect("Error creating client");

  if let Err(e) = client.start().await {
    println!("Client error: {}", e);
  }
}

#[tauri::command]
async fn get_file_contents(file_path: String)  {
  let file = File::open(file_path).await.unwrap();
  let mut reader = BufReader::new(file);
  let mut buffer = vec![0; 24 * 1024 * 1024]; // 24MB buffer

  loop {
    let bytes_read = reader.read(&mut buffer).await.unwrap();
    if bytes_read == 0 { break; }

    let chunk = std::str::from_utf8(&buffer[..bytes_read]).expect("Found invalid UTF-8");
    send_message(chunk).await;
  }
}
