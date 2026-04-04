# 🧠 **SmartAuction – Platform to Conduct and Participate in Auctions**

**SmartAuction** is a complete auction platform that empowers **admins** to conduct live auctions and **users** to participate seamlessly via **voice**, **web dashboard**, or **API**. It supports **real-time bidding**, **wallet management**, and **robust reporting** — making online auctions easy, transparent, and engaging.

---

## 🌟 **Features**

### 🎛️ **For Admin**
- ✅ **Admin Registration & Login**: Secure access to manage auctions  
- 🗂️ **Product Management**: Add, update, or remove auction products  
- 📢 **Conduct Auctions**: Start, pause, or close auctions with auto-expiry logic  
- 💰 **View Bids**: See live bids for any auction  
- 📊 **Auction Reports**: Detailed reports of auctions, participants, and final bids  
- 🔔 **Real-Time Notifications**: Alert bidders of auction status changes  

---

### 👤 **For Users**
- 📝 **User Registration & Login**: Simple onboarding for new bidders  
- 💳 **Recharge and Register Wallet**: Add funds securely to your personal auction wallet  
- 🎙️ **Voice Agent Participation**: Place bids, check status, and more using natural language  
- 📈 **Live Auction Participation**: Place real-time bids via web, API, or voice  
- 👁️ **View Highest Bid**: Instantly know the current top bid  
- 🛒 **Product Listings**: Browse active and upcoming auction items  
- 🔄 **Transaction History**: Track all wallet recharges and bidding transactions  

---

## 💰 **Wallet System**
- ✅ Add money to your **SmartAuction Wallet** via secure recharge  
- 🔒 Mandatory **wallet registration** for bidding eligibility  
- 💸 Automated **balance deduction** upon successful bidding  
- 📜 Transparent **wallet history** with full transaction logs  

---

## 🤖 **AI Voice Agent – Powered by OmniDimension**

**SmartAuction includes an intelligent AI Voice Agent** that makes participating in auctions as easy as speaking naturally.

### 🌟 **Uses of the AI Agent**
- 🎙️ **Place Bids**: “Place a bid of $500 on iPhone 15 Pro” — validated and submitted in real time  
- 📈 **Check Highest Bid**: “What’s the highest bid for my product?”  
- 🛍️ **Browse Products**: “Show me all available auctions.”  
- ⏱️ **Auction Timing**: “How much time is left?” or “When does the auction end?”  
- 💼 **Wallet Queries**: “What’s my balance?” or “Show my transactions.”  
- 📢 **Notifications**: Spoken alerts about new bids, outbids, auction endings  

---

### 🔗 **Built Using OmniDimension**
- **OmniDimension and ChatGPT 4.0 LLM Model** for advanced conversational auctions  
- **Context-Based Triggers**: Maintains conversation state for multi-step flows  
- **SmartAuction API Integration**: Real-time data for products, bids, auctions, and wallet  
- **Speech-to-Text**: Powered by **Deepgram (Nova-3)** for high-accuracy recognition  
- **Text-to-Speech**: Natural responses using **ElevenLabs**  

---

### 💡 **How It Works**
1️⃣ User speaks a command (e.g. “Bid 1000 on Auction A001”)  
2️⃣ The AI Agent parses and validates the intent  
3️⃣ Connects to SmartAuction APIs to place or retrieve bids  
4️⃣ Responds with clear, human-like confirmation  

✅ **ChatGPT 4.0 model makes SmartAuction an intelligent, truly interactive auction experience via voice.**

---

## 🛠️ **Tech Stack**

### 🔧 **Backend**
- **Language**: Python  
- **Framework**: Flask  
- **Database**: MongoDB  
- **APIs**: RESTful endpoints for products, auctions, bids, wallet, auth and users  

---

### 🎙️ **Voice Agent**
- **Platform**: OmniDimension  
- **Model**: ChatGPT-4.0  
- **Speech-to-Text**: Deepgram (Nova-3)  
- **Text-to-Speech**: ElevenLabs  

---

### 🌐 **Frontend**
- **Languages**: HTML, CSS, JavaScript, React
- **Admin Panel**: Full dashboard for managing auctions, products, bids, reports  
- **Deployment**: Render (backend) + Vercel (Frontend)

---

## 📁 **Current Project Layout**

- `backend/` contains the Flask API and backend environment settings.
- `frontend/` contains the Vite React app, its `package.json`, and its frontend `.env` file.
- Run frontend commands from `frontend/` after the split.
