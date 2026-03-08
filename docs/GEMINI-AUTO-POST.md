# Gemini se auto post (apne aap likha + publish)

Har din **6 AM IST** ko **Gemini** ek naya post likhta hai (1500+ words, SEO, trending topic) aur **direct publish** ho jata hai.

## 1. Gemini API key kaise lo

1. **Google AI Studio** pe jao: https://aistudio.google.com/apikey  
2. **Get API key** / **Create API key** pe click karo  
3. Key copy karo (e.g. `AIza...`)

## 2. Vercel pe env set karo

1. Vercel → Project → **Settings** → **Environment Variables**  
2. Add karo:
   - **Name:** `GEMINI_API_KEY`  
   - **Value:** jo key copy ki (Google AI Studio wali)  
3. **CRON_SECRET** bhi set hona chahiye (pehle jaisa), taaki sirf Vercel cron hi API call kar sake  

Save karo, phir **Redeploy** karo.

## 3. Cron (already set)

- **Path:** `/api/cron/generate-and-publish`  
- **Schedule:** `30 0 * * *` = har din **6:00 AM IST**  

Is time pe Vercel cron is route ko call karega → Gemini post generate karega → `posts` table me insert + publish.

## 4. Manual test

Browser/Postman se direct API mat kholna (CRON_SECRET chahiye). Local test ke liye:

```bash
curl -X GET "https://www.studymitra.in/api/cron/generate-and-publish" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Agar sab theek ho to response me `published: { title, slug }` aayega.

## 5. Kya post banta hai

- **Topic:** Gemini khud ek trending, useful topic choose karta hai (study tips, exam prep, career, productivity, etc.)  
- **Length:** Kam se kam **1500 words** (validation hai)  
- **Format:** Markdown (headings, bullets, paragraphs)  
- **SEO:** title, slug, excerpt, seo_title, seo_description sab Gemini bhar deta hai  
- **Original:** Prompt me bola hai no plagiarism, Indian students ke liye useful  

## 6. Agar Gemini fail ho jaye

- API key galat / limit / error → response me error message aayega  
- Word count 1500 se kam → post publish nahi hoga, message aayega  
- Duplicate slug → automatically unique slug ban jata hai (slug + timestamp)

## Summary

| Step | Kaam |
|------|------|
| 1 | Google AI Studio se **Gemini API key** banao |
| 2 | Vercel me **GEMINI_API_KEY** aur **CRON_SECRET** set karo |
| 3 | Deploy karo |
| 4 | Har din **6 AM IST** ko 1 post Gemini se likha + publish hoga |

Manual queue (scheduled_posts) ab use nahi ho raha is cron me; agar tum queue bhi use karna chahte ho to alag se `/api/cron/daily-publish` ko bhi ek time pe cron me add kar sakte ho.
