# OTP API with NestJS + Twilio 📲

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Twilio](https://img.shields.io/badge/Twilio-F22F46?style=for-the-badge&logo=twilio&logoColor=white)](https://www.twilio.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---


This is a simple OTP (One-Time Password) authentication service built with **NestJS**.  
It supports sending OTPs via **SMS** using [Twilio](https://www.twilio.com/), and verifying them securely.

---

## ✨ Features
- 📩 Send OTP to phone numbers (via Twilio SMS)
- ✅ Verify OTP codes
- 🛡️ Rate limiting to prevent abuse
- ⚡ Built with **NestJS**, **TypeScript**, **pnpm**
- 🔒 Environment variables managed with `.env`

---

## 📂 Project Structure
src/
┣ auth/
┃ ┣ dto/ # Data Transfer Objects (validation)
┃ ┣ auth.controller.ts # Handles routes
┃ ┣ auth.service.ts # Business logic
┃ ┣ auth.module.ts # Auth module
┣ app.module.ts # Main app module
┣ main.ts # Entry point


---

## 🛠️ Setup Instructions

### 1. Install dependencies
```bash
pnpm install

2. Configure Environment Variables

Create a .env file in the root with:
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

3. Run the project
pnpm run start:dev

🔑 API Endpoints
Send OTP

POST /auth/otp/send
Body: { "phone": "+91XXXXXXXXXX" }

Verify OTP
POST /auth/otp/verify
Body: { "identifier": "+91XXXXXXXXXX", "code": "123456" }

📌 Tech Stack

NestJS
Twilio
TypeScript
pnpm

📖 License

MIT — free to use & modify.
Made with ❤️ for the DotPe project.

---

### Step 3 — Save the file  

Then in PowerShell:

```powershell
git add README.md
git commit -m "docs: add custom README"
git push

