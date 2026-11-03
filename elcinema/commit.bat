@echo off
git add -A
git commit -m "feat: Add FAQ page, static page layouts, contact form, and internal routing

- Created FAQ route with comprehensive bilingual content (EN + AR)
- Enhanced StaticPage layout: 50/50 responsive split (content left, sticky image right)
- Added ContactForm component with validation and bilingual support
- Implemented smart fallback content system with /about.jpeg images
- Created normalize.ts for centralized title normalization
- Added requireAdminRole() and getRoleFromClaims() helpers to eliminate duplication
- Enhanced requireSupabaseEnv() validation in supabase-env.ts
- Updated all static pages (Privacy, About, Advertise, Terms, Contact) to use new layout
- Added FAQ, About, Contact, Advertise, Privacy, Terms to SECTION_ROUTES for internal routing
- Updated footer with FAQ link in Help section
- Improved spacing and removed large empty spaces in page layouts
- All external elcinema.com links now route internally through cardLink()
- Mobile responsive design with full viewport image height
- Professional 50/50 grid layout with sticky sidebars"
pause
