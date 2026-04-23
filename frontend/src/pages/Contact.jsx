import { useState } from "react";
import { Mail, MessageSquare, Phone } from "lucide-react";
import toast from "react-hot-toast";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Message sent! We'll get back to you soon.");
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-500">Have a question or issue? We're here to help.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          {[
            { icon: Mail, label: "Email", value: "support@useless.app", sub: "Reply within 24 hours" },
            { icon: Phone, label: "Phone", value: "+91 98765 43210", sub: "Mon–Fri, 10am–6pm" },
            { icon: MessageSquare, label: "Live Chat", value: "In-app chat", sub: "Chat with item owners directly" },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="card p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={18} className="text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{label}</p>
                <p className="text-sm text-primary-600">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-2 card p-6">
          {submitted ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">✉️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-500 text-sm">Thank you for reaching out. We'll get back to you within 24 hours.</p>
              <button onClick={() => { setForm({ name: "", email: "", subject: "", message: "" }); setSubmitted(false); }}
                className="btn-secondary text-sm mt-4">Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Name</label>
                  <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="Your name" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} required placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label className="label">Subject</label>
                <select className="input" value={form.subject} onChange={(e) => set("subject", e.target.value)} required>
                  <option value="">Select a topic</option>
                  <option>Rental dispute</option>
                  <option>Payment issue</option>
                  <option>Account problem</option>
                  <option>Report a listing</option>
                  <option>Feature request</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="label">Message</label>
                <textarea className="input min-h-[140px]" value={form.message} onChange={(e) => set("message", e.target.value)} required placeholder="Describe your issue or question in detail…" />
              </div>
              <button type="submit" className="btn-primary w-full py-3">Send Message</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
