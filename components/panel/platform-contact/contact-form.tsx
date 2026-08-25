"use client";

import { useState } from "react";
import { Check, ChevronLeft } from "lucide-react";

import { postPublicJson } from "@/lib/api/client";
import { CONTROL_CLASS, Field } from "./contact-field";
import { CONTACT } from "./contact.messages";

type FormState = {
  name: string;
  email: string;
  phone: string;
  category: string;
  subject: string;
  body: string;
};

const EMPTY: FormState = {
  name: "",
  email: "",
  phone: "",
  category: "TECHNICAL",
  subject: "",
  body: "",
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending) return;

    setSending(true);
    setError(null);
    try {
      await postPublicJson("/support/contact-messages", {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        category: form.category,
        subject: form.subject,
        body: form.body,
      });
      setSent(true);
    } catch {
      setError(CONTACT.form.error);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-lp-line bg-white p-10 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-lp-mint">
          <Check size={28} aria-hidden="true" className="text-lp-ink" />
        </span>
        <h2 className="text-xl font-extrabold text-lp-ink">
          {CONTACT.form.successTitle}
        </h2>
        <p className="max-w-[340px] text-[15px] leading-[1.9] text-lp-muted">
          {CONTACT.form.successBody}
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setForm(EMPTY);
          }}
          className="h-11 rounded-full border border-lp-line-2 px-6 text-sm font-semibold text-lp-ink-2 transition-colors hover:text-lp-ink"
        >
          {CONTACT.form.successAgain}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-lp-line bg-white p-6 sm:p-8"
    >
      <h2 className="text-xl font-extrabold text-lp-ink">
        {CONTACT.form.title}
      </h2>
      <p className="mt-2 text-[14px] leading-[1.9] text-lp-muted">
        {CONTACT.form.subtitle}
      </p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field id="contact-name" label={CONTACT.form.name}>
          <input
            id="contact-name"
            required
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            placeholder={CONTACT.form.namePlaceholder}
            className={CONTROL_CLASS}
          />
        </Field>
        <Field id="contact-email" label={CONTACT.form.email}>
          <input
            id="contact-email"
            required
            type="email"
            dir="ltr"
            value={form.email}
            onChange={(e) => set("email")(e.target.value)}
            placeholder={CONTACT.form.emailPlaceholder}
            className={`${CONTROL_CLASS} text-start`}
          />
        </Field>
        <Field id="contact-phone" label={CONTACT.form.phone}>
          <input
            id="contact-phone"
            value={form.phone}
            onChange={(e) => set("phone")(e.target.value)}
            placeholder={CONTACT.form.phonePlaceholder}
            className={CONTROL_CLASS}
          />
        </Field>
        <Field id="contact-category" label={CONTACT.form.category}>
          <select
            id="contact-category"
            value={form.category}
            onChange={(e) => set("category")(e.target.value)}
            className={CONTROL_CLASS}
          >
            {CONTACT.categories.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-5 grid gap-5">
        <Field id="contact-subject" label={CONTACT.form.subject}>
          <input
            id="contact-subject"
            required
            minLength={3}
            value={form.subject}
            onChange={(e) => set("subject")(e.target.value)}
            placeholder={CONTACT.form.subjectPlaceholder}
            className={CONTROL_CLASS}
          />
        </Field>
        <Field id="contact-body" label={CONTACT.form.body}>
          <textarea
            id="contact-body"
            required
            minLength={10}
            value={form.body}
            onChange={(e) => set("body")(e.target.value)}
            placeholder={CONTACT.form.bodyPlaceholder}
            className={`${CONTROL_CLASS} h-auto min-h-[150px] resize-y py-3 leading-[1.9]`}
          />
        </Field>
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-sm font-semibold text-red-500">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={sending}
        className="group mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-lp bg-lp-mint text-[16px] font-bold text-lp-ink shadow-lp-mint transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
      >
        <ChevronLeft
          size={17}
          aria-hidden="true"
          className="transition-transform group-hover:-translate-x-0.5"
        />
        {sending ? CONTACT.form.submitting : CONTACT.form.submit}
      </button>
    </form>
  );
}
