# Zoom Task Manager
###### A showcase of our Zoom Developer Ecosystem and our Unified Build Flow
___

## Get Started

Install Dependencies

```shell
npm i
```

Start your ngrok endpoints

```shell
ngrok start nextjs supabase
```

Copy .env.example to .env.local and fill out all the values

```shell
cp .env.example .env.local
```

Run the development server

```shell
npm run dev
```

## Upload the Manifest via a Terminal Command

### Source the .env File Directly

Environment variables defined in a .env file aren't automatically available in your shell. You'll need to load them into your shell session before running the curl command.

```shell
source .env

```

Then run your curl command:

```shell
curl --request PUT \
  --url https://api.zoom.us/v2/marketplace/apps/$ZOOM_APP_ID/manifest \
  --header "Authorization: Bearer $TEMP_ZOOM_ACCESS_TOKEN" \
  --header "Content-Type: application/json" \
  --data @zoom-app-manifest.json && echo "Request successful" || echo "Request failed"


```
If the curl request returns an exit code of 0 (indicating success), the shell will print “Request successful.” If it fails, it prints “Request failed.

