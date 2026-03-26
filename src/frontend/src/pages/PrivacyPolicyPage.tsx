import { ArrowLeft } from "lucide-react";
import type { NavigateFn } from "../App";

interface Props {
  navigate: NavigateFn;
}

export default function PrivacyPolicyPage({ navigate }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            data-ocid="privacy.link"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <img
            src="/assets/uploads/cargivo_logo_with_motion_trails-019d2b28-4cc6-7378-aae8-b18db2273b4e-1.png"
            alt="Cargivo"
            className="h-8 w-auto ml-auto"
          />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-border p-8 md:p-12">
          <div className="mb-8">
            <span className="inline-block bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              Legal
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-sm">
              Last updated: March 2026
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-8 text-gray-700">
            <p className="text-lg leading-relaxed">
              Welcome to Cargivo. We value your privacy and are committed to
              protecting your personal and business information.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                1. Information We Collect
              </h2>
              <p className="mb-2">
                We collect the following information when you use our platform:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name</li>
                <li>Company Name</li>
                <li>Email Address</li>
                <li>Phone Number</li>
                <li>GST Number</li>
                <li>Address</li>
                <li>Product requirements (box size, material, etc.)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                2. How We Use Information
              </h2>
              <p className="mb-2">We use your data to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide quotations</li>
                <li>Connect with suppliers</li>
                <li>Process orders</li>
                <li>Improve our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                3. Data Sharing
              </h2>
              <p className="mb-2">We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Verified suppliers for quotation and manufacturing</li>
                <li>Logistics partners for delivery</li>
              </ul>
              <p className="mt-3 font-semibold text-gray-900">
                We do NOT sell your data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                4. Data Security
              </h2>
              <p>
                We take reasonable measures to protect your data from
                unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                5. Cookies
              </h2>
              <p>Our website may use cookies to improve user experience.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                6. Contact
              </h2>
              <p>For any privacy concerns:</p>
              <p className="mt-2">
                Email:{" "}
                <a
                  href="mailto:support@cargivo.com"
                  className="text-primary hover:underline font-medium"
                >
                  support@cargivo.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-6 px-4 mt-8">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
