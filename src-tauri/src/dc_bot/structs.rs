use lazy_static::lazy_static;
use std::sync::Arc;
use serenity::{
  async_trait,
  model::gateway::Ready,
  prelude::*
};

lazy_static! {
  pub static ref GLOBAL_CONTEXT: Arc<Mutex<Option<Context>>> = Arc::new(Mutex::new(None));
  pub static ref IS_BOT_READY: Arc<Mutex<bool>> = Arc::new(Mutex::new(false));
}

pub struct Handler;
#[async_trait]
impl EventHandler for Handler {
  async fn ready(&self, ctx: Context, ready: Ready) {
    println!("{} is ready", ready.user.name);
    let mut global_context = GLOBAL_CONTEXT.lock().await;
    *global_context = Some(ctx);
    
    let mut is_bot_ready = IS_BOT_READY.lock().await;
    *is_bot_ready = true;
  }
}

#[derive(Clone, serde::Serialize)]
pub struct Payload {}
