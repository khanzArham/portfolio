"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState } from "react";
import { useForm } from "react-hook-form";
import { sendContact } from "@/app/actions/contact";
import { buttonClass } from "@/components/ui/button";
import { PaperPlaneIcon } from "@/components/ui/icons";
import {
  contactSchema,
  HONEYPOT_FIELD,
  type ContactField,
  type ContactInput,
  type ContactState,
} from "@/lib/contact/schema";

const initialState: ContactState = { status: "idle" };

const FIELDS: {
  name: ContactField;
  label: string;
  type?: string;
  autoComplete?: string;
  maxLength: number;
  multiline?: boolean;
  /** Spans both columns of the form grid on wider screens. */
  wide?: boolean;
  /** An example of what to type; the label still names the field. */
  placeholder: string;
}[] = [
  {
    name: "name",
    label: "Name",
    autoComplete: "name",
    maxLength: 100,
    placeholder: "e.g. John Doe",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    maxLength: 200,
    placeholder: "you@company.com",
  },
  {
    name: "message",
    label: "Message",
    maxLength: 5000,
    multiline: true,
    wide: true,
    placeholder: "Write your message here...",
  },
];

const inputClass =
  // Hover darkens the border; focus shows an accent glow, which replaces the
  // global focus outline here.
  "w-full rounded-md border border-line-strong bg-surface-raised px-3 py-2.5 text-ink transition-colors duration-fast ease-standard placeholder:text-muted hover:border-muted focus:border-accent focus:ring-1 focus:ring-accent focus-visible:outline-none aria-invalid:border-danger";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContact,
    initialState,
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
  });

  // With JavaScript, validate first and submit only valid input. Without
  // it, the form posts straight to the server action via `action`.
  const onSubmit = handleSubmit((_values, event) => {
    const formData = new FormData(event?.target as HTMLFormElement);
    startTransition(() => formAction(formData));
  });

  if (state.status === "success") {
    return (
      <p role="status" className="rounded-md bg-surface p-4">
        Thanks, your message was sent. I&apos;ll reply by email.
      </p>
    );
  }

  const serverErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form
      action={formAction}
      onSubmit={onSubmit}
      noValidate
      className="grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-2"
    >
      {FIELDS.map((field) => {
        const id = `contact-${field.name}`;
        const error = errors[field.name]?.message ?? serverErrors?.[field.name];
        const shared = {
          id,
          maxLength: field.maxLength,
          placeholder: field.placeholder,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": error ? `${id}-error` : undefined,
          className: inputClass,
          ...register(field.name),
        };

        return (
          <div
            key={field.name}
            className={`flex flex-col gap-2 ${field.wide ? "md:col-span-2" : ""}`}
          >
            <label htmlFor={id} className="font-medium">
              {field.label}
            </label>
            {field.multiline ? (
              <textarea rows={6} {...shared} />
            ) : (
              <input
                type={field.type ?? "text"}
                autoComplete={field.autoComplete}
                {...shared}
              />
            )}
            {error && (
              <p id={`${id}-error`} className="text-sm text-danger">
                {error}
              </p>
            )}
          </div>
        );
      })}

      {/* Honeypot: hidden from people and assistive tech, filled by bots. */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 overflow-hidden"
      >
        <label htmlFor="contact-website">Leave this field empty</label>
        <input
          id="contact-website"
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {state.status === "error" && (
        <p role="alert" className="text-danger md:col-span-2">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        // Full width on phones, compact and left-aligned from md up.
        className={`${buttonClass("primary", "px-6")} w-full md:col-span-2 md:w-fit md:justify-self-start`}
      >
        <PaperPlaneIcon />
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
