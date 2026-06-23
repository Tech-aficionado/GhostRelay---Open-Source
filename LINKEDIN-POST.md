# LinkedIn Post (within 3,000 character limit)

---

Your email is the most leaked personal data on the internet. 🔓

4 billion+ records exposed last year. Email is in nearly every breach.

I built something to fix this ↓

⸻

👻 GhostRelay — privacy-first email aliasing.

→ Generate a unique alias (a7x9k2@ghostrelay.me)
→ Use it instead of your real email
→ Emails forward instantly to your inbox ⚡
→ Alias compromised? Disable it in one click 🚫

Your real address stays invisible. 🛡️

⸻

🎯 Why it matters:

When a service leaks your email, attackers use it for:
• Credential stuffing 🔑
• Targeted phishing 🎣
• Selling to data brokers 💰

One alias per service. One compromise stays contained. ✅

⸻

⚙️ The stack:

☁️ Cloudflare Workers — API + email processing
🗄️ D1 — edge SQLite database
📬 Email Routing — inbound handling
⚛️ Next.js 16 + React 19
✉️ Resend — SPF/DKIM/DMARC delivery
🎨 Tailwind v4

Deployed across 250+ edge locations globally. 🌍

⸻

🚀 Features shipped:

✦ Wildcard aliases — pattern-based auto-creation
✦ Temporary aliases — auto-expire after N days/emails
✦ Multi-destination forwarding
✦ Sender blocklist per alias
✦ Analytics dashboard 📊
✦ Bounce detection
✦ Browser extension 🧩
✦ 2FA with email OTP 🔐
✦ Full data export 📦

⸻

🧠 Hardest problems:

1️⃣ Email deliverability — SPF/DKIM/DMARC for forwarded mail. One wrong config = spam folder.

2️⃣ MIME parsing at the edge — multipart emails with no Node.js stdlib.

3️⃣ Dual auth — HMAC sessions + Firebase OAuth in one stateless backend.

4️⃣ Edge-first data model — relational integrity in SQLite at scale.

⸻

Every layer has real consequences. Bad DKIM = emails vanish. Token bug = users locked out. No half-measures. 💪

🔗 ghostrelay.me

Working on edge computing or email infra? Let's connect. 🤝

---

#privacy #emailsecurity #cloudflare #fullstack #webdev #nextjs #react #typescript #edgecomputing #cybersecurity #buildinpublic #softwaredevelopment #saas #startup #indiehacker #javascript #serverless #dataprotection #infosec #coding
