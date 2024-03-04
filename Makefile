default:
	DISCORD_TOKEN=$(cat TOKEN.pem) npm run tauri dev
	exit 0
