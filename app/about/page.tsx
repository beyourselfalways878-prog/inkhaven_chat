export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold">About InkHaven</h1>
      <p className="text-slate-300">
        InkHaven is a modern anonymous chat platform that prioritizes safety, privacy, and meaningful connections.
        Founded in 2024, we have helped millions of users connect with like-minded people worldwide.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">Our Mission</h2>
          <p className="text-slate-300">
            To create a safe space for anonymous conversations where people can be themselves without judgment.
            We believe in fostering genuine connections through smart matching and robust safety measures.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">What Sets Us Apart</h2>
          <ul className="text-slate-300 space-y-2">
            <li>• Interest-based matching algorithm</li>
            <li>• Advanced moderation and reporting</li>
            <li>• End-to-end anonymous communication</li>
            <li>• Multi-language support</li>
            <li>• High-quality video and voice features</li>
          </ul>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-3">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Safety First</h3>
            <p className="text-slate-300 text-sm">
              Comprehensive moderation and user protection systems.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Privacy by Design</h3>
            <p className="text-slate-300 text-sm">
              No personal data collection, anonymous by default.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Innovation</h3>
            <p className="text-slate-300 text-sm">
              Constantly improving matching and user experience.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-slate-400">
          Have questions? Check out our <a href="/faq" className="text-blue-400 hover:underline">FAQ</a> or <a href="/contact" className="text-blue-400 hover:underline">contact us</a>.
        </p>
      </div>
    </main>
  )
}
