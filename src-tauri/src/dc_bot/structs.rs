use lazy_static::lazy_static;
use std::sync::Arc;
use serenity::{
  async_trait,
  model::gateway::Ready,
  prelude::*
};

lazy_static! {
  pub static ref GLOBAL_CONTEXT: Arc<Mutex<Option<Context>>> = Arc::new(Mutex::new(None));
}

pub struct Handler;
#[async_trait]
impl EventHandler for Handler {
  async fn ready(&self, ctx: Context, ready: Ready) {
    println!("{} is ready", ready.user.name);
    let mut global_context = GLOBAL_CONTEXT.lock().await;
    *global_context = Some(ctx);
  }
}

#[derive(Clone, serde::Serialize)]
pub struct Payload {}
