import Link from 'next/link'

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Sitemap</h1>
          <p className="text-muted-foreground">
            Navigate through all the pages on Sledge AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Main Pages */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">Main Pages</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-primary hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-primary hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="text-primary hover:underline">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-primary hover:underline">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/promo" className="text-primary hover:underline">
                  Promotions
                </Link>
              </li>
            </ul>
          </section>

          {/* Product Pages */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">Products</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/product" className="text-primary hover:underline">
                  Product Overview
                </Link>
              </li>
              <li>
                <Link href="/product/finance-management" className="text-primary hover:underline">
                  Finance Management
                </Link>
              </li>
            </ul>
          </section>

          {/* Industries */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">Industries</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/industries/construction" className="text-primary hover:underline">
                  Construction
                </Link>
              </li>
              <li>
                <Link href="/industries/concrete" className="text-primary hover:underline">
                  Concrete
                </Link>
              </li>
            </ul>
          </section>

          {/* Integrations */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">Integrations</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/integration" className="text-primary hover:underline">
                  All Integrations
                </Link>
              </li>
              <li>
                <Link href="/integration/gmail" className="text-primary hover:underline">
                  Gmail Integration
                </Link>
              </li>
              <li>
                <Link href="/integration/outlook" className="text-primary hover:underline">
                  Outlook Integration
                </Link>
              </li>
              <li>
                <Link href="/integration/quickbooks" className="text-primary hover:underline">
                  QuickBooks Integration
                </Link>
              </li>
            </ul>
          </section>

          {/* Account */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">Account</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/sign-in" className="text-primary hover:underline">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="text-primary hover:underline">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/forget-password" className="text-primary hover:underline">
                  Forgot Password
                </Link>
              </li>
            </ul>
          </section>

          {/* Dashboard (Protected) */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">Dashboard</h2>
            <p className="text-sm text-muted-foreground mb-2">
              (Requires authentication)
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-primary hover:underline">
                  Dashboard Home
                </Link>
              </li>
              <li>
                <Link href="/bills" className="text-primary hover:underline">
                  Bills
                </Link>
              </li>
              <li>
                <Link href="/project-bills" className="text-primary hover:underline">
                  Project Bills
                </Link>
              </li>
              <li>
                <Link href="/vendors" className="text-primary hover:underline">
                  Vendors
                </Link>
              </li>
              <li>
                <Link href="/lien-waiver" className="text-primary hover:underline">
                  Lien Waiver
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="text-primary hover:underline">
                  Integrations Settings
                </Link>
              </li>
              <li>
                <Link href="/hr" className="text-primary hover:underline">
                  HR
                </Link>
              </li>
              <li>
                <Link href="/legal" className="text-primary hover:underline">
                  Legal
                </Link>
              </li>
              <li>
                <Link href="/report" className="text-primary hover:underline">
                  Reports
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-primary hover:underline">
                  Profile
                </Link>
              </li>
            </ul>
          </section>

          {/* Legal */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">Legal</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="text-primary hover:underline">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </section>
        </div>

        {/* XML Sitemap Link */}
        <div className="mt-12 text-center pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Looking for the XML sitemap?{' '}
            <Link href="/sitemap.xml" className="text-primary hover:underline font-medium">
              View XML Sitemap
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
