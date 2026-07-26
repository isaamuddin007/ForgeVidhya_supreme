import { LegalPage, type LegalSection } from "@/pages/LegalPage";

const sections: LegalSection[] = [
  {
    heading: "1. Information we collect",
    body: [
      "When you apply to a cohort, subscribe to our newsletter, or contact us, we collect the information you choose to share: your name, email address, college name, branch, year of study, and any message you send us.",
      "We also collect limited technical data automatically — such as browser type, device, and approximate region — solely to keep the site secure and to understand which content helps students most.",
    ],
  },
  {
    heading: "2. How we use your information",
    body: [
      "We use your information to respond to your applications and enquiries, to place you in the right program, to send you the newsletter you signed up for, and to improve our curriculum based on aggregate, de-identified patterns.",
      "We never sell your personal data. We do not share it with third parties for advertising. We may share it with our hiring startup partners only after you explicitly opt in to be introduced.",
    ],
  },
  {
    heading: "3. Cookies and local storage",
    body: [
      "We use local storage to remember your light/dark theme preference. We do not use tracking cookies for advertising. Analytics, where used, is privacy-respecting and does not store personally identifiable identifiers.",
    ],
  },
  {
    heading: "4. Data retention",
    body: [
      "We keep your application data for as long as you are an active student, and for up to 24 months afterward so we can help with mentor references and hiring introductions. You can request deletion at any time by emailing us.",
    ],
  },
  {
    heading: "5. Your rights",
    body: [
      "You have the right to access, correct, or delete the personal data we hold about you, and to opt out of marketing communications at any time. Email us and we will respond within 30 days.",
    ],
  },
  {
    heading: "6. Security",
    body: [
      "We use industry-standard practices to protect your data, including encryption in transit and at rest. No method of transmission over the internet is fully secure, but we work hard to protect your information.",
    ],
  },
  {
    heading: "7. Children's privacy",
    body: [
      "Our services are designed for college students who are at least 18 years old. We do not knowingly collect information from anyone under 18. If you believe we have done so, please contact us so we can delete it.",
    ],
  },
  {
    heading: "8. Changes to this policy",
    body: [
      "We may update this policy from time to time. The 'last updated' date at the top of this page reflects the most recent version. Material changes will be highlighted on our homepage.",
    ],
  },
];

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How forgeVidhya collects, uses, and protects your personal information."
      updated="July 2026"
      intro="forgeVidhya takes your privacy seriously. This policy explains what we collect, why we collect it, and the control you have over your data. We built this for students, and we treat your data the way we'd want ours treated."
      sections={sections}
    />
  );
}
