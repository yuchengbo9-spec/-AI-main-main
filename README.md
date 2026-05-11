<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/d0e785bf-c065-4a4d-8ae4-6984cd68f365

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure Doubao (Volcengine Ark) env vars (recommended via `.env.local`):
   - `DOUBAO_API_KEY` (your Ark API key)
   - `DOUBAO_MODEL_ID` (your endpoint/model id, usually starts with `ep-`)
   - `DOUBAO_ENDPOINT` (optional, defaults to Ark chat completions)
3. Run the app:
   `npm run dev`
