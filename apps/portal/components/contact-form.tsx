"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`UZBron — ${name || "Yangi xabar"}`);
    const body = encodeURIComponent(`Ism: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:info@uzbron.uz?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Ism</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ismingiz"
            className="h-11 w-full rounded-lg border border-line bg-canvas px-3 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-primary focus:bg-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@misol.uz"
            className="h-11 w-full rounded-lg border border-line bg-canvas px-3 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-primary focus:bg-white"
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Xabar</label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Savol yoki taklifingizni yozing..."
          className="w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-primary focus:bg-white"
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-lg bg-[#0b1a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#13265a]"
      >
        <Send size={17} /> Xabar yuborish
      </button>
      {sent && (
        <p className="text-sm text-success">
          Rahmat! Pochta ilovangiz ochildi — yuborilgach, biz tez orada javob beramiz.
        </p>
      )}
    </form>
  );
}
