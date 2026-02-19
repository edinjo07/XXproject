'use client'

import { useState, useEffect } from 'react'

export function AgeVerification() {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const verified = localStorage.getItem('ageVerified')
    if (!verified) {
      setShowModal(true)
    }
  }, [])

  const handleConfirm = () => {
    localStorage.setItem('ageVerified', 'true')
    setShowModal(false)
  }

  const handleDecline = () => {
    window.location.href = 'https://www.google.com'
  }

  if (!showModal) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="bg-surface p-8 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Age Verification</h2>
        <p className="text-textSecondary mb-6">
          You must be 18 years or older to access this content. This website
          contains adult material and is intended for adults only.
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleConfirm}
            className="flex-1 bg-primary hover:bg-primaryHover text-white py-3 rounded-lg font-semibold"
          >
            I am 18 or older
          </button>
          <button
            onClick={handleDecline}
            className="flex-1 bg-surface hover:bg-surfaceHover border border-textSecondary text-white py-3 rounded-lg font-semibold"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  )
}
