import { ArrowLeft } from "lucide-react";
import type { NavigateFn } from "../App";

interface Props {
  navigate: NavigateFn;
}

export default function RefundPolicyPage({ navigate }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            data-ocid="refund.link"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <img
            src="/assets/uploads/image-4-1.png"
            alt="Cargivo"
            className="h-8 w-auto ml-auto"
          />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-border p-8 md:p-12">
          <div className="mb-8">
            <span className="inline-block bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              Legal
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Refund &amp; Cancellation Policy
            </h1>
            <p className="text-muted-foreground text-sm">
              Last updated: March 2026
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                1. Order Cancellation
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Orders can be cancelled before production starts</li>
                <li>After production begins, cancellation is not allowed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                2. Advance Payment
              </h2>
              <p>Advance payment is non-refundable once production starts.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                3. Refund Cases
              </h2>
              <p className="mb-2">Refund may be applicable only if:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Supplier fails to start work</li>
                <li>Order is not processed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                4. Quality Issues
              </h2>
              <p>
                Any product issues must be resolved directly with the supplier.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                5. Delivery Issues
              </h2>
              <p>Delays in logistics are not eligible for refund.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                6. Contact
              </h2>
              <p>For support:</p>
              <p className="mt-2">
                Email:{" "}
                <a
                  href="mailto:support@cargivo.com"
                  className="text-orange-500 hover:underline font-medium"
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
            className="text-orange-500 hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
