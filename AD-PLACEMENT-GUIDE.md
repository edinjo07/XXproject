# Ad Banner Implementation Guide

## 📦 Components Created

### 1. **AdBanner.tsx** - Main Ad Component
Supports multiple ad formats with responsive options:
- `LeaderboardAd` - 728x90 (horizontal banner)
- `BillboardAd` - 970x250 (large top banner)
- `RectangleAd` - 300x250 (medium rectangle)
- `SkyscraperAd` - 300x600 (sidebar vertical)
- `MobileAd` - 320x50 (mobile banner)
- `ResponsiveAd` - Flexible size (recommended)

### 2. **AdScript.tsx** - Global Ad Script Loader
Loads Google AdSense script once in the app layout.

---

## 🚀 Setup Instructions

### Step 1: Add AdScript to Layout
Add to `src/app/layout.tsx`:

```tsx
import { AdScript } from '@/components/AdScript'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <AdScript publisherId="ca-pub-YOUR-PUBLISHER-ID" />
      </head>
      <body>
        {/* ... */}
      </body>
    </html>
  )
}
```

### Step 2: Enable Ads in Environment
Add to `.env.local`:

```env
NEXT_PUBLIC_ADS_ENABLED=true
```

### Step 3: Configure AdSense
1. Sign up at https://www.google.com/adsense
2. Get your Publisher ID (ca-pub-XXXXXXXXXXXXXXXX)
3. Create ad units and get slot IDs
4. Replace placeholders in `AdBanner.tsx` line 76

---

## 💡 Usage Examples

### Homepage Banner (Top)
```tsx
import { BillboardAd, ResponsiveAd } from '@/components/AdBanner'

export default function HomePage() {
  return (
    <div>
      {/* Desktop: Billboard, Mobile: Responsive */}
      <div className="hidden md:flex justify-center mb-8">
        <BillboardAd slot="1234567890" />
      </div>
      <div className="md:hidden mb-8">
        <ResponsiveAd slot="1234567891" />
      </div>
      
      {/* Your content */}
    </div>
  )
}
```

### Video Page Sidebar
```tsx
import { SkyscraperAd } from '@/components/AdBanner'

export default function VideoPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        {/* Video player */}
      </div>
      
      <div>
        {/* Sticky sidebar ad */}
        <div className="sticky top-20">
          <SkyscraperAd slot="2345678901" />
        </div>
      </div>
    </div>
  )
}
```

### Between Content Sections
```tsx
import { LeaderboardAd } from '@/components/AdBanner'

export default function Page() {
  return (
    <div>
      <section>{/* Featured Videos */}</section>
      
      {/* Ad between sections */}
      <div className="flex justify-center my-8">
        <LeaderboardAd slot="3456789012" />
      </div>
      
      <section>{/* Latest Videos */}</section>
    </div>
  )
}
```

---

## 🎯 Recommended Placements

### High Priority (Implement First)

1. **Video Player Page - Sidebar**
   - Format: Skyscraper (300x600)
   - Location: Right sidebar, sticky
   - Slot: Create "video_sidebar_1"

2. **Homepage - Top Banner**
   - Format: Billboard (970x250) desktop, Responsive mobile
   - Location: Above "Featured Videos"
   - Slot: Create "homepage_top_1"

3. **Video Player Page - Below Player**
   - Format: Leaderboard (728x90)
   - Location: Between video and comments
   - Slot: Create "video_below_player_1"

### Medium Priority

4. **Homepage - Between Sections**
   - Format: Leaderboard
   - Location: Between "Featured" and "Latest"
   - Slot: Create "homepage_mid_1"

5. **Profile Pages - Below Header**
   - Format: Responsive
   - Location: Between profile info and videos
   - Slot: Create "profile_below_header_1"

### Lower Priority

6. **Creator Dashboard - Below Stats**
   - Format: Leaderboard
   - Location: Between stats and video table
   - Slot: Create "dashboard_below_stats_1"

7. **Footer Ad (Global)**
   - Format: Leaderboard or Responsive
   - Location: Bottom of every page
   - Slot: Create "global_footer_1"

---

## 🎨 Styling Notes

- Ads automatically match dark theme
- Placeholder shows when ads disabled (development)
- Responsive ads adjust to container width
- Border and background blend with UI

---

## 📊 Ad Network Alternatives

The component works with:
- **Google AdSense** (default setup)
- **Media.net**
- **PropellerAds**
- **ExoClick** (adult content friendly)
- **TrafficJunky** (adult content specialists)

For adult content, you may need specialized networks like:
- **ExoClick**
- **TrafficJunky**
- **JuicyAds**
- **EroAdvertising**

Just replace the script URL and data attributes in AdBanner.tsx.

---

## ⚠️ Important Notes

1. **Adult Content Restrictions**
   - Google AdSense may NOT approve adult sites
   - Use adult-friendly networks like ExoClick or TrafficJunky
   - Review each network's content policies

2. **Performance**
   - Ads load after page interactive (afterInteractive)
   - Lazy loading via Script component
   - No blocking of main content

3. **Privacy Compliance**
   - Add cookie consent banner before enabling
   - Update Privacy Policy with ad tracking info
   - Consider GDPR/CCPA requirements

4. **Testing**
   - Set `NEXT_PUBLIC_ADS_ENABLED=false` during development
   - Test with real ad units before production
   - Monitor CLS (Cumulative Layout Shift)

---

## 🔧 Customization

### Change Ad Sizes
Edit `getAdDimensions()` in AdBanner.tsx:

```tsx
case 'custom':
  return 'w-[960px] h-[600px]'
```

### Add Custom Ad Network
Replace AdSense code in AdBanner.tsx with your network's embed code.

### Style Ad Containers
Customize `ad-container` class or pass `className` prop:

```tsx
<ResponsiveAd slot="123" className="shadow-lg rounded-xl" />
```

---

## 📈 Revenue Optimization Tips

1. **Place ads above the fold** (visible without scrolling)
2. **Use larger formats** on desktop (billboard > leaderboard > rectangle)
3. **Sidebar ads** have high visibility on video pages
4. **Between content sections** feels natural to users
5. **Don't overload pages** (3-4 ads max per page)
6. **Mobile optimization** crucial (50%+ traffic)
7. **Test different positions** and track CTR

---

## Next Steps

1. ✅ Components created
2. ⏭️ Add AdScript to layout
3. ⏭️ Sign up for ad network
4. ⏭️ Get Publisher ID and slot IDs
5. ⏭️ Implement priority placements
6. ⏭️ Test with real ad units
7. ⏭️ Monitor performance and revenue
