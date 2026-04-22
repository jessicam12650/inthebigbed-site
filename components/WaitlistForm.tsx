"use client";

import { useState, type FormEvent } from "react";

const MAILCHIMP_ACTION =
  process.env.NEXT_PUBLIC_MAILCHIMP_ACTION ||
  "https://hotmail.us9.list-manage.com/subscribe/post?u=229fdd0eb0fd96b25d7441643&id=d43c188b80&f_id=0019cee1f0";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(_e: FormEvent<HTMLFormElement>) {
    // Let the form submit to Mailchimp in a new tab; flip to a thank-you state locally.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-sm border-2 border-sage bg-sage/10 p-5 text-ink">
        <p className="font-head text-lg">You're on the list 🐾</p>
        <p className="mt-1 text-sm text-ink/70">
          Thanks for joining. We'll be in touch before we launch in Liverpool.
        </p>
      </div>
    );
  }

  return (
    <form
      action={MAILCHIMP_ACTION}
      method="post"
      target="_blank"
      onSubmit={onSubmit}
      className="flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-stretch"
      noValidate={false}
    >
      <input
        type="email"
        name="EMAIL"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        required
        className="field flex-1"
        aria-label="Email address"
      />
      {/* Honeypot for Mailchimp bots */}
      <div aria-hidden="true" style={{ position: "absolute", left: -5000 }}>
        <input
          type="text"
          name="b_229fdd0eb0fd96b25d7441643_d43c188b80"
          tabIndex={-1}
          defaultValue=""
        />
      </div>
      <button type="submit" name="subscribe" className="btn-dark whitespace-nowrap px-6 py-3 text-base">
        Get early access
      </button>
    </form>
  );
}
