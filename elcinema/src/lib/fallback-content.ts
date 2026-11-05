/**
 * Bundled bilingual content for static information pages.
 * Ensures pages always load with meaningful content.
 */
import type { Lang } from "@/types/home";
import type { StaticContentPage } from "@/types/content-view";

export const FALLBACK_PAGES: Record<string, Record<Lang, StaticContentPage>> = {
  faq: {
    en: {
      title: "Frequently Asked Questions",
      image: "/about.jpeg",
      sections: [
        {
          heading: "Booking & Payment",
          blocks: [
            {
              type: "p",
              text: "Learn how to book tickets and make payments securely on elCinema.",
            },
            {
              type: "list",
              items: [
                "How do I book tickets online?",
                "What payment methods are accepted?",
                "Is my payment information secure?",
                "Can I modify or cancel my booking?",
                "Do you offer group bookings?",
              ],
            },
          ],
        },
        {
          heading: "Content & Upload",
          blocks: [
            {
              type: "p",
              text: "Information about uploading content and managing your media.",
            },
            {
              type: "list",
              items: [
                "How can I upload content to elCinema?",
                "What file formats are supported?",
                "What are the size limitations?",
                "How long does content approval take?",
                "Can I edit content after uploading?",
              ],
            },
          ],
        },
        {
          heading: "User Registration & Profile Management",
          blocks: [
            {
              type: "p",
              text: "Get help with creating accounts and managing your profile.",
            },
            {
              type: "list",
              items: [
                "How do I create an account?",
                "How do I update my profile information?",
                "How do I manage my preferences?",
                "Can I have multiple accounts?",
                "How do I delete my account?",
              ],
            },
          ],
        },
        {
          heading: "General Questions",
          blocks: [
            {
              type: "p",
              text: "Answers to common questions about elCinema services.",
            },
            {
              type: "list",
              items: [
                "What is elCinema?",
                "Is elCinema available on mobile?",
                "How do I contact customer support?",
                "What are your operating hours?",
                "Do you offer refunds?",
              ],
            },
          ],
        },
        {
          heading: "Reset Your Password",
          blocks: [
            {
              type: "p",
              text: "Having trouble accessing your account? Here's how to reset your password.",
            },
            {
              type: "list",
              items: [
                "How do I reset my password?",
                "I didn't receive the reset email - what do I do?",
                "How do I choose a strong password?",
                "Can I use my old password again?",
                "How often should I change my password?",
              ],
            },
          ],
        },
      ],
    },
    ar: {
      title: "الأسئلة الشائعة",
      image: "/about.jpeg",
      sections: [
        {
          heading: "الحجز والدفع",
          blocks: [
            {
              type: "p",
              text: "تعرف على كيفية حجز التذاكر والدفع بأمان على إلسينما.",
            },
            {
              type: "list",
              items: [
                "كيف أحجز التذاكر عبر الإنترنت؟",
                "ما هي طرق الدفع المقبولة؟",
                "هل معلومات الدفع الخاصة بي آمنة؟",
                "هل يمكنني تعديل أو إلغاء حجزي؟",
                "هل تقدمون حجوزات جماعية؟",
              ],
            },
          ],
        },
        {
          heading: "المحتوى والرفع",
          blocks: [
            {
              type: "p",
              text: "معلومات حول رفع المحتوى وإدارة وسائطك.",
            },
            {
              type: "list",
              items: [
                "كيف يمكنني رفع محتوى إلى إلسينما؟",
                "ما هي صيغ الملفات المدعومة؟",
                "ما هي حدود الحجم؟",
                "كم من الوقت يستغرق التحقق من المحتوى؟",
                "هل يمكنني تعديل المحتوى بعد الرفع؟",
              ],
            },
          ],
        },
        {
          heading: "تسجيل المستخدم وإدارة الملف الشخصي",
          blocks: [
            {
              type: "p",
              text: "احصل على المساعدة في إنشاء الحسابات وإدارة ملفك الشخصي.",
            },
            {
              type: "list",
              items: [
                "كيف أنشئ حسابًا؟",
                "كيف أحدّث معلومات ملفي الشخصي؟",
                "كيف أدير تفضيلاتي؟",
                "هل يمكن لي أن يكون لدي عدة حسابات؟",
                "كيف أحذف حسابي؟",
              ],
            },
          ],
        },
        {
          heading: "أسئلة عامة",
          blocks: [
            {
              type: "p",
              text: "إجابات على الأسئلة الشائعة حول خدمات إلسينما.",
            },
            {
              type: "list",
              items: [
                "ما هي إلسينما؟",
                "هل إلسينما متاحة على الهاتف المحمول؟",
                "كيف أتواصل مع دعم العملاء؟",
                "ما هي ساعات التشغيل الخاصة بك؟",
                "هل تقدمون استرجاع الأموال؟",
              ],
            },
          ],
        },
        {
          heading: "إعادة تعيين كلمة المرور",
          blocks: [
            {
              type: "p",
              text: "هل تواجه مشكلة في الوصول إلى حسابك؟ إليك كيفية إعادة تعيين كلمة المرور.",
            },
            {
              type: "list",
              items: [
                "كيف أعيد تعيين كلمة المرور الخاصة بي؟",
                "لم أتلق بريد إعادة التعيين - ماذا أفعل؟",
                "كيف أختار كلمة مرور قوية؟",
                "هل يمكنني استخدام كلمة المرور القديمة مرة أخرى؟",
                "كم مرة يجب أن أغير كلمة المرور؟",
              ],
            },
          ],
        },
      ],
    },
  },
  privacy_policy: {
    en: {
      title: "Privacy Policy",
      image: "/about.jpeg",
      sections: [
        {
          heading: "Your Privacy",
          blocks: [
            {
              type: "p",
              text: "We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share your personal information.",
            },
          ],
        },
        {
          heading: "Information We Collect",
          blocks: [
            {
              type: "p",
              text: "We may collect information you provide directly to us, such as when you create an account, contact us, or use our services.",
            },
            {
              type: "list",
              items: [
                "Contact information (name, email, phone number)",
                "Account information (username, password)",
                "Content you create or upload",
                "Communication preferences",
              ],
            },
          ],
        },
        {
          heading: "How We Use Your Information",
          blocks: [
            {
              type: "list",
              items: [
                "To provide and improve our services",
                "To communicate with you",
                "To personalize your experience",
                "To comply with legal obligations",
              ],
            },
          ],
        },
        {
          heading: "Contact Us",
          blocks: [
            {
              type: "p",
              text: "If you have any questions about this Privacy Policy, please contact us using the contact form.",
            },
          ],
        },
      ],
    },
    ar: {
      title: "سياسة الخصوصية",
      image: "/about.jpeg",
      sections: [
        {
          heading: "خصوصيتك",
          blocks: [
            {
              type: "p",
              text: "نحن ملتزمون بحماية خصوصيتك. تشرح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا ومشاركتنا لمعلوماتك الشخصية.",
            },
          ],
        },
        {
          heading: "المعلومات التي نجمعها",
          blocks: [
            {
              type: "p",
              text: "قد نجمع المعلومات التي تقدمها لنا مباشرة، مثل عند إنشاء حساب أو الاتصال بنا أو استخدام خدماتنا.",
            },
            {
              type: "list",
              items: [
                "معلومات الاتصال (الاسم والبريد الإلكتروني ورقم الهاتف)",
                "معلومات الحساب (اسم المستخدم وكلمة المرور)",
                "المحتوى الذي تنشئه أو تحمله",
                "تفضيلات التواصل",
              ],
            },
          ],
        },
        {
          heading: "كيفية استخدام معلوماتك",
          blocks: [
            {
              type: "list",
              items: [
                "لتوفير وتحسين خدماتنا",
                "للتواصل معك",
                "لتخصيص تجربتك",
                "للامتثال للالتزامات القانونية",
              ],
            },
          ],
        },
        {
          heading: "اتصل بنا",
          blocks: [
            {
              type: "p",
              text: "إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا باستخدام نموذج الاتصال.",
            },
          ],
        },
      ],
    },
  },
  about_us: {
    en: {
      title: "About Us",
      image: "/about.jpeg",
      sections: [
        {
          heading: "Welcome to elCinema",
          blocks: [
            {
              type: "p",
              text: "elCinema is Egypt's premier guide to cinema, television, and entertainment. We provide comprehensive information about movies, showtimes, cast, crew, and more.",
            },
          ],
        },
        {
          heading: "Our Mission",
          blocks: [
            {
              type: "p",
              text: "Our mission is to connect movie enthusiasts with the films and shows they love, providing accurate, up-to-date information about Egypt's entertainment landscape.",
            },
          ],
        },
        {
          heading: "What We Offer",
          blocks: [
            {
              type: "list",
              items: [
                "Movie and TV show information",
                "Theater showtimes and booking",
                "Cast and crew details",
                "Box office data",
                "Entertainment news and reviews",
              ],
            },
          ],
        },
      ],
    },
    ar: {
      title: "من نحن",
      image: "/about.jpeg",
      sections: [
        {
          heading: "أهلاً بك في إلسينما",
          blocks: [
            {
              type: "p",
              text: "إلسينما هي دليل مصر الأول للسينما والتلفاز والترفيه. نقدم معلومات شاملة عن الأفلام ومواعيد العرض والممثلين والطاقم التقني والمزيد.",
            },
          ],
        },
        {
          heading: "مهمتنا",
          blocks: [
            {
              type: "p",
              text: "مهمتنا هي ربط عشاق الأفلام بالأفلام والبرامج التي يحبونها، مع توفير معلومات دقيقة ومحدثة عن المشهد الترفيهي في مصر.",
            },
          ],
        },
        {
          heading: "ما نقدمه",
          blocks: [
            {
              type: "list",
              items: [
                "معلومات الأفلام والبرامج التلفزيونية",
                "مواعيد العرض والحجز",
                "تفاصيل الممثلين والطاقم",
                "بيانات شباك التذاكر",
                "أخبار وتقييمات الترفيه",
              ],
            },
          ],
        },
      ],
    },
  },
  contact: {
    en: {
      title: "Contact Us",
      image: "/about.jpeg",
      sections: [
        {
          heading: "Get in Touch",
          blocks: [
            {
              type: "p",
              text: "Have a question or suggestion? We'd love to hear from you! Reach out to us using the contact form or connect with us on social media.",
            },
          ],
        },
        {
          heading: "Support",
          blocks: [
            {
              type: "p",
              text: "Our support team is here to help. Whether you have questions about showtimes, bookings, or general inquiries, we're ready to assist.",
            },
          ],
        },
        {
          heading: "Follow Us",
          blocks: [
            {
              type: "list",
              items: [
                "Facebook: facebook.com/elCinemaEgypt",
                "Twitter/X: @elCinema",
                "Instagram: @elCinemaEgypt",
              ],
            },
          ],
        },
      ],
    },
    ar: {
      title: "اتصل بنا",
      image: "/about.jpeg",
      sections: [
        {
          heading: "تواصل معنا",
          blocks: [
            {
              type: "p",
              text: "هل لديك سؤال أو اقتراح؟ نود أن نسمع منك! يمكنك التواصل معنا باستخدام نموذج الاتصال أو الاتصال بنا على وسائل التواصل الاجتماعي.",
            },
          ],
        },
        {
          heading: "الدعم",
          blocks: [
            {
              type: "p",
              text: "فريق الدعم لدينا هنا لمساعدتك. سواء كان لديك أسئلة حول مواعيد العرض أو الحجز أو استفسارات عامة، نحن مستعدون للمساعدة.",
            },
          ],
        },
        {
          heading: "تابعنا",
          blocks: [
            {
              type: "list",
              items: [
                "فيسبوك: facebook.com/elCinemaEgypt",
                "تويتر/إكس: @elCinema",
                "إنستجرام: @elCinemaEgypt",
              ],
            },
          ],
        },
      ],
    },
  },
  advertise: {
    en: {
      title: "Advertise With Us",
      image: "/about.jpeg",
      sections: [
        {
          heading: "Reach Your Audience",
          blocks: [
            {
              type: "p",
              text: "elCinema is the leading platform for entertainment information in Egypt. Advertise with us to reach millions of movie and TV enthusiasts.",
            },
          ],
        },
        {
          heading: "Why Advertise on elCinema?",
          blocks: [
            {
              type: "list",
              items: [
                "Access to millions of monthly users",
                "Highly engaged audience of entertainment enthusiasts",
                "Multiple advertising formats and placements",
                "Proven track record in the entertainment industry",
                "Flexible packages to fit your budget",
              ],
            },
          ],
        },
        {
          heading: "Get Started",
          blocks: [
            {
              type: "p",
              text: "Ready to reach your audience? Contact our advertising team to discuss custom packages and pricing options.",
            },
          ],
        },
      ],
    },
    ar: {
      title: "الإعلان معنا",
      image: "/about.jpeg",
      sections: [
        {
          heading: "وصل إلى جمهورك",
          blocks: [
            {
              type: "p",
              text: "إلسينما هي المنصة الرائدة لمعلومات الترفيه في مصر. تابع إعلانتك معنا للوصول إلى ملايين عشاق الأفلام والتلفاز.",
            },
          ],
        },
        {
          heading: "لماذا تعلن على إلسينما؟",
          blocks: [
            {
              type: "list",
              items: [
                "الوصول إلى ملايين المستخدمين الشهريين",
                "جمهور متفاعل من محبي الترفيه",
                "صيغ إعلانية متعددة والعديد من الأماكن",
                "سجل مثبت في صناعة الترفيه",
                "حزم مرنة تناسب ميزانيتك",
              ],
            },
          ],
        },
        {
          heading: "ابدأ الآن",
          blocks: [
            {
              type: "p",
              text: "هل أنت مستعد للوصول إلى جمهورك؟ اتصل بفريق الإعلان لدينا لمناقشة الحزم والأسعار المخصصة.",
            },
          ],
        },
      ],
    },
  },
  terms: {
    en: {
      title: "Terms of Service",
      image: "/about.jpeg",
      sections: [
        {
          heading: "Acceptance of Terms",
          blocks: [
            {
              type: "p",
              text: "By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.",
            },
          ],
        },
        {
          heading: "Use License",
          blocks: [
            {
              type: "p",
              text: "Permission is granted to temporarily download one copy of the materials (information or software) on elCinema for personal, non-commercial transitory viewing only.",
            },
          ],
        },
        {
          heading: "Disclaimer",
          blocks: [
            {
              type: "p",
              text: "The materials on elCinema are provided on an 'as is' basis. elCinema makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.",
            },
          ],
        },
        {
          heading: "Limitations",
          blocks: [
            {
              type: "p",
              text: "In no event shall elCinema or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on elCinema.",
            },
          ],
        },
      ],
    },
    ar: {
      title: "شروط الخدمة",
      image: "/about.jpeg",
      sections: [
        {
          heading: "قبول الشروط",
          blocks: [
            {
              type: "p",
              text: "بالوصول واستخدام هذا الموقع، فإنك توافق على الالتزام بشروط وأحكام هذه الاتفاقية.",
            },
          ],
        },
        {
          heading: "ترخيص الاستخدام",
          blocks: [
            {
              type: "p",
              text: "يُمنح الإذن بتنزيل مؤقت لنسخة واحدة من المواد على إلسينما لعرض شخصي غير تجاري فقط.",
            },
          ],
        },
        {
          heading: "إخلاء المسؤولية",
          blocks: [
            {
              type: "p",
              text: "المواد على إلسينما تُقدم 'كما هي'. إلسينما لا تقدم أي ضمانات، صريحة أو ضمنية، وتخلي مسؤوليتها عن جميع الضمانات الأخرى.",
            },
          ],
        },
        {
          heading: "التحديدات",
          blocks: [
            {
              type: "p",
              text: "لا تتحمل إلسينما أو موردوها أي مسؤولية عن أي أضرار ناشئة عن استخدام أو عدم القدرة على استخدام المواد على إلسينما.",
            },
          ],
        },
      ],
    },
  },
};

/**
 * Get fallback content for a static page path.
 * Paths like "/en/privacy_policy/" -> returns fallback privacy policy content.
 */
export function getFallbackPage(path: string, lang: Lang): StaticContentPage | null {
  // Extract page type from path: "/en/privacy_policy/" -> "privacy_policy"
  const match = path.match(/\/(?:en|ar)\/([a-z_]+)\/?$/);
  if (!match) return null;

  const pageType = match[1];
  if (!pageType) return null;
  const fallback = FALLBACK_PAGES[pageType];

  if (!fallback) return null;

  return fallback[lang] || fallback.en;
}
