const FAQ = [
  {
    q: 'Do I need an account?',
    a: 'No. You can start chatting as a guest. Registration is optional and unlocks premium features.'
  },
  {
    q: 'How does matching work?',
    a: 'We use your selected interests, language, and age group to find better pairings. The algorithm prioritizes shared interests for more meaningful conversations.'
  },
  {
    q: 'What communication options are available?',
    a: 'InkHaven is a text-based chat platform. We focus on meaningful written conversations with mood-based matching.'
  },
  {
    q: 'How do I report someone?',
    a: 'In chat, use the Report action to submit a report and immediately separate. Our moderation team reviews all reports within 24 hours.'
  },
  {
    q: 'Are conversations private?',
    a: 'Yes. All chats are end-to-end anonymous. We don\'t store personal information and messages are automatically deleted after 24 hours.'
  },
  {
    q: 'What languages are supported?',
    a: 'We support English, Spanish, French, Hindi, Bengali, and Telugu. More languages coming soon.'
  },
  {
    q: 'Is the service free?',
    a: 'Basic features are free. Premium unlocks unlimited chats, priority matching, and exclusive mood filters.'
  },
  {
    q: 'How do I stay safe?',
    a: 'Never share personal information. Use the report feature for suspicious behavior. Our AI moderation helps detect inappropriate content.'
  }
]

export default function FaqPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
      <p className="text-slate-700 dark:text-slate-300">
        Find answers to common questions about InkHaven Chat.
      </p>
      <div className="space-y-3">
        {FAQ.map((item) => (
          <div key={item.q} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4">
            <p className="font-semibold">{item.q}</p>
            <p className="text-slate-700 dark:text-slate-300 mt-1">{item.a}</p>
          </div>
        ))}
      </div>
      <div className="text-center pt-6">
        <p className="text-slate-600 dark:text-slate-400">
          Still have questions? <a href="/contact" className="text-blue-400 hover:underline">Contact our support team</a>.
        </p>
      </div>
    </main>
  )
}
