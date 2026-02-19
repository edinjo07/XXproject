export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="bg-surface p-8 rounded-lg space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-3">1. Information We Collect</h2>
          <p className="text-textSecondary mb-3">
            We collect the following information:
          </p>
          <ul className="list-disc list-inside text-textSecondary space-y-2">
            <li>Account information (email, username, password)</li>
            <li>Profile information (avatar, bio)</li>
            <li>Content you upload (videos, descriptions)</li>
            <li>Usage data (views, interactions)</li>
            <li>Technical data (IP address, browser type, device information)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">2. How We Use Your Information</h2>
          <p className="text-textSecondary mb-3">
            Your information is used to:
          </p>
          <ul className="list-disc list-inside text-textSecondary space-y-2">
            <li>Provide and maintain the service</li>
            <li>Process and display content</li>
            <li>Calculate and distribute earnings</li>
            <li>Prevent fraud and abuse</li>
            <li>Monitor platform performance</li>
            <li>Communicate with you about the service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">3. Data Sharing</h2>
          <p className="text-textSecondary">
            We do not sell your personal information. We may share data with:
          </p>
          <ul className="list-disc list-inside text-textSecondary space-y-2">
            <li>Service providers who help operate the platform</li>
            <li>Law enforcement when required by law</li>
            <li>Third parties with your consent</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">4. Cookies and Tracking</h2>
          <p className="text-textSecondary">
            We use cookies and similar technologies to track activity on our platform and store 
            certain information. This helps us provide a better user experience and prevent fraud.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">5. Data Security</h2>
          <p className="text-textSecondary">
            We implement security measures to protect your data. However, no method of transmission 
            over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">6. Your Rights</h2>
          <p className="text-textSecondary mb-3">
            You have the right to:
          </p>
          <ul className="list-disc list-inside text-textSecondary space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your account</li>
            <li>Withdraw consent for data processing</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">7. Data Retention</h2>
          <p className="text-textSecondary">
            We retain your data for as long as your account is active or as needed to provide 
            services. You can request account deletion at any time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">8. Children's Privacy</h2>
          <p className="text-textSecondary">
            Our service is not intended for anyone under 18 years of age. We do not knowingly 
            collect information from users under 18.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">9. Changes to Privacy Policy</h2>
          <p className="text-textSecondary">
            We may update this privacy policy from time to time. We will notify you of any changes 
            by posting the new policy on this page.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">10. Contact Us</h2>
          <p className="text-textSecondary">
            If you have questions about this privacy policy, please contact us through the platform.
          </p>
        </section>
      </div>
    </div>
  )
}
