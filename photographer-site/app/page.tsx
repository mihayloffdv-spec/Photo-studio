import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="font-bold text-xl">
              Photo Studio
            </Link>
            <div className="flex items-center space-x-8">
              <Link href="#portfolio" className="text-gray-600 hover:text-black">
                Portfolio
              </Link>
              <Link href="#about" className="text-gray-600 hover:text-black">
                About
              </Link>
              <Link href="#contact" className="text-gray-600 hover:text-black">
                Contact
              </Link>
              <Link
                href="/admin"
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Capturing Life&apos;s
            <br />
            Beautiful Moments
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Professional photography for weddings, portraits, families, and special events.
            Every photo tells a story.
          </p>
          <Link
            href="#contact"
            className="inline-block bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition"
          >
            Book a Session
          </Link>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Portfolio</h2>

          {/* Placeholder grid - will be replaced with actual portfolio photos */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-400"
              >
                Photo {i}
              </div>
            ))}
          </div>

          <p className="text-center text-gray-500 mt-8">
            Portfolio photos will be displayed here.
            <br />
            Upload them through the admin panel.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">About Me</h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
              Photo placeholder
            </div>
            <div>
              <p className="text-gray-600 mb-4">
                Welcome! I&apos;m a professional photographer with a passion for capturing
                authentic moments and creating timeless images.
              </p>
              <p className="text-gray-600 mb-4">
                With years of experience in wedding, portrait, and family photography,
                I bring a unique perspective to every shoot.
              </p>
              <p className="text-gray-600">
                Let&apos;s create something beautiful together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
          <p className="text-gray-400 mb-8">
            Ready to book a session? Have questions? I&apos;d love to hear from you.
          </p>

          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            <a
              href="mailto:hello@example.com"
              className="text-lg hover:text-gray-300"
            >
              hello@example.com
            </a>
            <span className="hidden md:block text-gray-600">|</span>
            <a href="tel:+1234567890" className="text-lg hover:text-gray-300">
              +1 (234) 567-890
            </a>
          </div>

          <div className="mt-12">
            <Link
              href="/gallery/DEMO"
              className="text-gray-400 hover:text-white text-sm"
            >
              Have a gallery code? Access your photos here →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Photo Studio. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
