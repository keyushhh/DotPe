## APIs in this Repo

This repo contains two separate API implementations:

### 🔹 dotpe-api (Windows setup)
- Original Node.js/Express OTP API created on Windows.
- Run with:
  ```bash
  cd dotpe-api
  pnpm install
  pnpm dev

Accessible at: http://localhost:3000

🔹 dotpe-api-mac (macOS setup)

New Node.js/Express OTP API built and tested on macOS.

Run with:
cd dotpe-api-mac
pnpm install
pnpm dev
Accessible at: http://localhost:3000

💡 Both APIs provide:

/health → check server status

/api/v1/otp/send → generate OTP

/api/v1/otp/verify → verify OTP

⚠️ Each API has its own .env and node_modules. Install separately in each folder.

Save the file.

---

### 2) stage & commit
```bash
git add README.md
git commit -m "docs: add section for Windows + macOS API usage"
