/**
 * Public contact form. There is no backend to receive form posts, so the
 * submit action hands the composed message to the visitor's own email app
 * (mailto) addressed to the site's real ticket/contact address published on
 * elcinema.com/contact — nothing is silently discarded.
 */
import { useState } from "react";
import { Mail, MessageSquare, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { makeT } from "@/i18n";
import type { Lang } from "@/types/home";

/** The address elcinema.com publishes on its own contact page. */
const CONTACT_EMAIL = "tickets@elcinema.com";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactFormProps {
  lang: Lang;
}

export function ContactForm({ lang }: ContactFormProps) {
  const t = makeT(lang);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [sent, setSent] = useState(false);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validate = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) newErrors.name = t("contact.required");
    if (!formData.email.trim()) newErrors.email = t("contact.required");
    else if (!validateEmail(formData.email)) newErrors.email = t("contact.invalidEmail");
    if (!formData.subject.trim()) newErrors.subject = t("contact.required");
    if (!formData.message.trim()) newErrors.message = t("contact.required");
    else if (formData.message.trim().length < 10) newErrors.message = t("contact.messageTooShort");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    const subject = encodeURIComponent(`elCinema — ${formData.subject} (${formData.name})`);
    const body = encodeURIComponent(
      `${formData.message}\n\n—\n${formData.name}\n${formData.email}`,
    );
    // Hand the composed message to the visitor's email client; the browser
    // keeps the app page intact.
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => setSent(false), 8000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4" aria-label={t("contact.formTitle")}>
      {/* Status Messages */}
      {sent && (
        <div className="rounded-lg bg-success/10 p-4" role="status">
          <p className="text-sm font-medium text-success">{t("contact.mailOpened")}</p>
        </div>
      )}

      {/* Name Field */}
      <div className="space-y-1.5">
        <label htmlFor="contact-name" className="flex items-center gap-2 text-sm font-semibold">
          <User className="h-4 w-4" aria-hidden="true" />
          {t("contact.name")}
        </label>
        <Input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={t("contact.name")}
          className={cn("transition", errors.name && "border-destructive")}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          aria-invalid={errors.name ? true : undefined}
        />
        {errors.name && (
          <p id="contact-name-error" className="text-sm font-semibold text-destructive">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-1.5">
        <label htmlFor="contact-email" className="flex items-center gap-2 text-sm font-semibold">
          <Mail className="h-4 w-4" aria-hidden="true" />
          {t("contact.email")}
        </label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className={cn("transition", errors.email && "border-destructive")}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          aria-invalid={errors.email ? true : undefined}
        />
        {errors.email && (
          <p id="contact-email-error" className="text-sm font-semibold text-destructive">
            {errors.email}
          </p>
        )}
      </div>

      {/* Subject Field */}
      <div className="space-y-1.5">
        <label htmlFor="contact-subject" className="flex items-center gap-2 text-sm font-semibold">
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          {t("contact.subject")}
        </label>
        <Input
          id="contact-subject"
          name="subject"
          type="text"
          value={formData.subject}
          onChange={handleChange}
          placeholder={t("contact.subject")}
          className={cn("transition", errors.subject && "border-destructive")}
          aria-describedby={errors.subject ? "contact-subject-error" : undefined}
          aria-invalid={errors.subject ? true : undefined}
        />
        {errors.subject && (
          <p id="contact-subject-error" className="text-sm font-semibold text-destructive">
            {errors.subject}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="text-sm font-semibold">
          {t("contact.message")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder={t("contact.message")}
          rows={4}
          className={cn(
            "w-full resize-none rounded-lg border border-border bg-background px-4 py-2 font-sans text-base",
            "transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
            errors.message && "border-destructive",
          )}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          aria-invalid={errors.message ? true : undefined}
        />
        {errors.message && (
          <p id="contact-message-error" className="text-sm font-semibold text-destructive">
            {errors.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" size="lg" className="w-full gap-2 sm:w-auto">
        <Send className="h-4 w-4" aria-hidden="true" />
        {t("contact.send")}
      </Button>
    </form>
  );
}
