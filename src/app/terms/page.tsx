export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="bg-surface p-8 rounded-lg space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-3">1. Acceptance of Terms</h2>
          <p className="text-textSecondary">
            By accessing and using this platform, you accept and agree to be bound by the terms 
            and provision of this agreement. If you do not agree to these terms, please do not 
            use this service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">2. Age Requirement</h2>
          <p className="text-textSecondary">
            You must be at least 18 years of age to use this platform. By using this service, 
            you represent and warrant that you are at least 18 years old.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">3. Content Guidelines</h2>
          <p className="text-textSecondary mb-3">
            Users who upload content agree to the following:
          </p>
          <ul className="list-disc list-inside text-textSecondary space-y-2">
            <li>Content must comply with all applicable laws and regulations</li>
            <li>You own or have the right to use all content you upload</li>
            <li>Content must not violate the rights of any third party</li>
            <li>Illegal content is strictly prohibited</li>
            <li>All participants in videos must be 18 years or older</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">4. Revenue Sharing</h2>
          <p className="text-textSecondary">
            Creators earn money based on the views their content receives. The platform reserves 
            the right to modify payout rates. Earnings are calculated per 1,000 views and are 
            subject to verification and anti-fraud measures.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">5. Content Moderation</h2>
          <p className="text-textSecondary">
            All uploaded content is subject to review and approval by platform moderators. 
            We reserve the right to reject or remove any content that violates these terms or 
            our community guidelines.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">6. Account Termination</h2>
          <p className="text-textSecondary">
            We reserve the right to terminate or suspend your account at any time for violations 
            of these terms or for any other reason at our sole discretion.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">7. Disclaimer</h2>
          <p className="text-textSecondary">
            This platform is provided "as is" without any warranties. We are not responsible for 
            user-generated content.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">8. Changes to Terms</h2>
          <p className="text-textSecondary">
            We reserve the right to modify these terms at any time. Continued use of the platform 
            after changes constitutes acceptance of the new terms.
          </p>
        </section>
      </div>
    </div>
  )
}
