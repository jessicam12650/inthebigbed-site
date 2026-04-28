"use client";

import Link from "next/link";
import { useState } from "react";
import EnquiryForm, { type ProviderKind } from "./EnquiryForm";

type Props = {
  providerKind: ProviderKind;
  providerId: string;
  providerName: string;
  claimed: boolean;
  browseHref: string;
  browseLabel: string;
};

export default function EnquirySection({
  providerKind,
  providerId,
  providerName,
  claimed,
  browseHref,
  browseLabel,
}: Props) {
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  if (sent) {
    return (
      <div className="w-full rounded-sm border border-sage/40 bg-sage/15 p-6 text-cream md:p-8">
        <h3 className="font-head text-2xl text-cream md:text-3xl">Enquiry sent 🎉</h3>
        <p className="mt-3 text-base leading-relaxed text-cream/90">
          We&apos;ve sent your message to {providerName}.
          {submittedEmail ? (
            <>
              {" "}You&apos;ll get a confirmation email at{" "}
              <span className="font-semibold">{submittedEmail}</span> within a few minutes.
            </>
          ) : null}{" "}
          They&apos;ll be in touch within a few days.
        </p>
        <Link
          href={browseHref}
          className="mt-5 inline-block text-sm font-sub text-rust underline hover:text-cream"
        >
          {browseLabel} →
        </Link>
      </div>
    );
  }

  return (
    <EnquiryForm
      providerKind={providerKind}
      providerId={providerId}
      providerName={providerName}
      claimed={claimed}
      onSubmitted={(email) => {
        setSubmittedEmail(email);
        setSent(true);
      }}
    />
  );
}
