import { useState } from "react";
import { Loader2, Mail, MessageSquare, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Lang } from "@/types/home";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactFormProps {
  lang: Lang;
}

const STRINGS = {
  en: {
    name: "Your Name",
    email: "Email Address",
    subject: "Subject",
    message: "Message",
    send: "Send Message",
    sending: "Sending...",
    success: "Thank you! We'll get back to you soon.",
    error: "Something went wrong. Please try again.",
    required: "This field is required",
    invalidEmail: "Please enter a valid email",
    messageTooShort: "Message must be at least 10 characters",
  },
  ar: {
    name: "اسمك",
    email: "عنوان بريدك الإلكتروني",
    subject: "الموضوع",
    message: "الرسالة",
    send: "إرسال الرسالة",
    sending: "جاري الإرسال...",
    success: "شكراً! سنعود إليك قريباً.",
    error: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    required: "هذا الحقل مطلوب",
    invalidEmail: "يرجى إدخال بريد إلكتروني صحيح",
    messageTooShort: "يجب أن تكون الرسالة 10 أحرف على الأقل",
  },
};

export function ContactForm({ lang }: ContactFormProps) {
  const t = STRINGS[lang];
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validate = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) newErrors.name = t.required;
    if (!formData.email.trim()) newErrors.email = t.required;
    else if (!validateEmail(formData.email)) newErrors.email = t.invalidEmail;
    if (!formData.subject.trim()) newErrors.subject = t.required;
    if (!formData.message.trim()) newErrors.message = t.required;
    else if (formData.message.trim().length < 10) newErrors.message = t.messageTooShort;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    setStatus("loading");

    try {
      // In a real app, this would call a server function
      // For now, simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });

      // Reset success message after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4">
      {/* Status Messages */}
      {status === "success" && (
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">{t.success}</p>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{t.error}</p>
        </div>
      )}

      {/* Name Field */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold">
          <User className="h-4 w-4" />
          {t.name}
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder={t.name}
          disabled={status === "loading"}
          className={cn("transition", errors.name && "border-red-500 focus:ring-red-500")}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-red-500">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold">
          <Mail className="h-4 w-4" />
          {t.email}
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          disabled={status === "loading"}
          className={cn("transition", errors.email && "border-red-500 focus:ring-red-500")}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-red-500">
            {errors.email}
          </p>
        )}
      </div>

      {/* Subject Field */}
      <div className="space-y-1.5">
        <label htmlFor="subject" className="flex items-center gap-2 text-sm font-semibold">
          <MessageSquare className="h-4 w-4" />
          {t.subject}
        </label>
        <Input
          id="subject"
          name="subject"
          type="text"
          value={formData.subject}
          onChange={handleChange}
          placeholder={t.subject}
          disabled={status === "loading"}
          className={cn("transition", errors.subject && "border-red-500 focus:ring-red-500")}
          aria-describedby={errors.subject ? "subject-error" : undefined}
        />
        {errors.subject && (
          <p id="subject-error" className="text-sm text-red-500">
            {errors.subject}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div className="space-y-1.5">
        <label htmlFor="message" className="text-sm font-semibold">
          {t.message}
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder={t.message}
          disabled={status === "loading"}
          rows={4}
          className={cn(
            "w-full rounded-lg border border-border bg-background px-4 py-2 font-sans text-base",
            "transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
            "resize-none",
            errors.message && "border-red-500 focus:ring-red-500"
          )}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && (
          <p id="message-error" className="text-sm text-red-500">
            {errors.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={status === "loading"}
        size="lg"
        className="w-full gap-2 sm:w-auto"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.sending}
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            {t.send}
          </>
        )}
      </Button>
    </form>
  );
}
