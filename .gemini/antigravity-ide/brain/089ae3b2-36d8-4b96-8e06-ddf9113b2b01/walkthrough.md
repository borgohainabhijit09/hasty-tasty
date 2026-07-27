# Contact Information Updates & B2B Email Routing Walkthrough

We have updated the bakery's business information (phone, email, WhatsApp, address, and founding year) across the storefront. We have also integrated a server-side email routing system for new B2B enquiries using Nodemailer.

---

## Changes Made

### 1. Updated Store Metadata & Contact Cards
- **Footer**: Updated the WhatsApp icon link in [Footer.tsx](file:///c:/Users/320301827/Documents/WORKSPACE/01_CLIENTS/Active/hastytasty-website/apps/web/src/components/Footer.tsx) to point directly to the store's number (`https://wa.me/919864402305`).
- **About Us**: Changed the founding year placeholder from `2018` to `2000` inside [about/page.tsx](file:///c:/Users/320301827/Documents/WORKSPACE/01_CLIENTS/Active/hastytasty-website/apps/web/src/app/(storefront)/about/page.tsx).
- **Contact Us**: Modified the contact details in [contact/page.tsx](file:///c:/Users/320301827/Documents/WORKSPACE/01_CLIENTS/Active/hastytasty-website/apps/web/src/app/(storefront)/contact/page.tsx):
  - Phone call action href: `tel:+919864402305`
  - WhatsApp chat action href: `https://wa.me/919864402305`
  - Email mailto: `mailto:hastytastyglt@gmail.com`
  - Physical store address text:
    ```
    Hasty Tasty,
    Main Road, Golaghat,
    Assam - 785621
    ```
- **Customer Portal**: Updated support phone and email variables inside [account/layout.tsx](file:///c:/Users/320301827/Documents/WORKSPACE/01_CLIENTS/Active/hastytasty-website/apps/web/src/app/(storefront)/account/layout.tsx).
- **Admin Settings**: Modified the default dashboard Settings fallback in [settings/page.tsx](file:///c:/Users/320301827/Documents/WORKSPACE/01_CLIENTS/Active/hastytasty-website/apps/web/src/app/admin/(dashboard)/settings/page.tsx) to align with the new store support variables.

### 2. Configured Nodemailer and B2B Enquiry Email Dispatch
- **Dependencies**: Added `nodemailer` (and development types) to [package.json](file:///c:/Users/320301827/Documents/WORKSPACE/01_CLIENTS/Active/hastytasty-website/apps/api/package.json).
- **Backend Email Service**: Added a `sendEnquiryEmail` utility function and integrated it with the POST route `/api/enquiries` inside the backend [index.ts](file:///c:/Users/320301827/Documents/WORKSPACE/01_CLIENTS/Active/hastytasty-website/apps/api/index.ts).
  - Fetches the newly submitted enquiry, including matching client details, their B2B company profile (GST numbers), and requested products info from the database.
  - Formats a detailed, mobile-friendly HTML email (with visual headers, tables of requested items, and notes) and dispatches it directly to `hastytastyglt@gmail.com`.
  - Dispatches asynchronously in the background so it does not block the customer's request.
  - Checks for environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) and safely logs the email structure in the dev console if no SMTP keys are configured yet (preventing crashes).

---

## SMTP Configuration Guide

To enable live email delivery to your inbox, add the following variables to your `.env` configuration file in `apps/api/`:

```env
# SMTP Configuration (Example for Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=hastytastyglt@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Your 16-character Google App Password
```

> [!NOTE]
> If using Gmail, you must enable 2-Factor Authentication on your Google Account (`hastytastyglt@gmail.com`), search for **App Passwords** in your account settings, generate a new password under the label "Mail", and paste the 16-character code into the `SMTP_PASS` field.
