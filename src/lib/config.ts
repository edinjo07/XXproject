export const config = {
  bunnyStream: {
    apiKey: process.env.BUNNY_STREAM_API_KEY || '',
    libraryId: process.env.BUNNY_STREAM_LIBRARY_ID || '',
    cdnHostname: process.env.BUNNY_STREAM_CDN_HOSTNAME || '',
  },
  platform: {
    payoutRatePer1000: parseFloat(process.env.PAYOUT_RATE_PER_1000_VIEWS || '5'),
    minimumPayoutAmount: parseFloat(process.env.MINIMUM_PAYOUT_AMOUNT || '50'),
  },
  viewTracking: {
    // Prevent duplicate views from same IP within this time window
    duplicateWindowMinutes: 30,
  },
}
