import { BuyMeACoffee } from '../../components/BuyMeACoffee';

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold">About InkHaven</h1>
      <p className="text-slate-700 dark:text-slate-300">
        InkHaven is a modern anonymous chat platform that prioritizes safety, privacy, and meaningful connections.
        Created by <strong>Twinkle Tiwari</strong>, our mission is to help millions of users connect with like-minded people worldwide.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">Our Mission</h2>
          <p className="text-slate-700 dark:text-slate-300">
            To create a safe space for anonymous conversations where people can be themselves without judgment.
            We believe in fostering genuine connections through smart matching and robust safety measures.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">What Sets Us Apart</h2>
          <ul className="text-slate-700 dark:text-slate-300 space-y-2">
            <li>• Interest-based matching algorithm</li>
            <li>• Advanced moderation and reporting</li>
            <li>• End-to-end anonymous communication</li>
            <li>• Multi-language support</li>
            <li>• High-quality video and voice features</li>
          </ul>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-3">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Safety First</h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm">
              Comprehensive moderation and user protection systems.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Privacy by Design</h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm">
              No personal data collection, anonymous by default.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Innovation</h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm">
              Constantly improving matching and user experience.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">A Message from the Creator</h2>
        <div className="max-w-2xl mx-auto space-y-4 text-slate-700 dark:text-slate-300 italic">
          <p>
            &quot;InkHaven was born from a simple belief: in a world of noise, we all deserve a quiet corner to just <em>be</em>.
          </p>
          <p>
            I built this sanctuary not as a product, but as a promise—a promise that your voice matters, your privacy is sacred, and your connection with others can be genuine without the weight of an identity. Every line of code was written with the hope that someone, somewhere, would find a friend, a listener, or a moment of peace here.
          </p>
          <p>
            If this space has brought a little light to your day, and you&apos;d like to help keep it glowing, you can support my work below. But more than that, thank you for being here. You are the heartbeat of InkHaven.&quot;
          </p>
          <div className="mt-4 font-semibold text-slate-900 dark:text-white not-italic">
            — Twinkle Tiwari
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <BuyMeACoffee />
        </div>
      </div>

      <div className="text-center">
        <p className="text-slate-600 dark:text-slate-400">
          Have questions? Check out our <a href="/faq" className="text-blue-400 hover:underline">FAQ</a> or <a href="mailto:namamicreations@zenithcryptoai.in" className="text-blue-400 hover:underline">contact us</a>.
        </p>
      </div>
    </main>
  )
}
