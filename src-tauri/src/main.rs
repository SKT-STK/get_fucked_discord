// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{ env, sync::Arc };
use lazy_static::lazy_static;
use serenity::{
  all::ChannelId,
  async_trait,
  model::gateway::Ready,
  prelude::*
};

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

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![init_bot, send_message])
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
async fn send_message(msg: String) {
  let global_context = GLOBAL_CONTEXT.lock().await;
  let message = MAIN_CHANNEL.say(&*global_context.as_ref().unwrap().http(), &msg).await.unwrap();
  println!("{}", message.id);
}
