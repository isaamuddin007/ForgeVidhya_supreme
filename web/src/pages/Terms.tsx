import { LegalPage, type LegalSection } from "@/pages/LegalPage";

const sections: LegalSection[] = [
  {
    heading: "1. Acceptance of terms",
    body: [
      "By accessing this website or enrolling in any forgeVidhya program, you agree to be bound by these Terms of Service. If you do not agree, please do not use the site or our programs.",
    ],
  },
  {
    heading: "2. Our services",
    body: [
      "forgeVidhya provides educational programs in AI automation, AI production, and AI-assisted creation. The foundational track is free; paid tracks include live mentorship and project review.",
      "We do not guarantee employment, income, or specific career outcomes. Your results depend on your effort, application, and circumstances. We provide the forge; you bring the fire.",
    ],
  },
  {
    heading: "3. Eligibility",
    body: [
      "Our programs are intended for students aged 18 and above. By enrolling, you confirm that you meet this requirement and that the information you provide in your application is accurate.",
    ],
  },
  {
    heading: "4. Accounts and conduct",
    body: [
      "You are responsible for maintaining the confidentiality of any account credentials and for all activity under your account. You agree not to harass mentors or peers, plagiarize others' work, or misuse our platform to harm others.",
      "We may suspend or terminate access for conduct that we determine, in good faith, violates these terms or harms the community.",
    ],
  },
  {
    heading: "5. Intellectual property",
    body: [
      "All course materials, videos, written content, and branding on this site are the property of forgeVidhya and are protected by applicable intellectual property laws. You may not redistribute, resell, or publicly repost paid course content.",
      "Projects you build during a program belong to you, entirely. We may showcase your work with attribution only after your explicit permission.",
    ],
  },
  {
    heading: "6. Payments and refunds",
    body: [
      "Paid tracks are clearly priced at the time of enrolment. If you are unsatisfied within the first 7 days of a paid cohort and have not completed more than 25% of the coursework, you may request a full refund by emailing us.",
      "Refunds are processed to the original payment method within 14 business days.",
    ],
  },
  {
    heading: "7. Third-party links",
    body: [
      "Our programs reference third-party tools (such as AI APIs, automation platforms, and hosting providers). We are not responsible for the availability, pricing, or practices of those services. Their terms govern your use of them.",
    ],
  },
  {
    heading: "8. Disclaimer and limitation of liability",
    body: [
      "Our services are provided 'as is' without warranties of any kind. To the maximum extent permitted by law, forgeVidhya shall not be liable for any indirect, incidental, or consequential damages arising from your use of the site or programs.",
    ],
  },
  {
    heading: "9. Governing law",
    body: [
      "These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.",
    ],
  },
  {
    heading: "10. Changes to these terms",
    body: [
      "We may update these terms from time to time. Continued use of the site after changes are posted constitutes acceptance of the updated terms.",
    ],
  },
];

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      description="The terms and conditions that govern your use of forgeVidhya's website and educational programs."
      updated="July 2026"
      intro="Welcome to forgeVidhya. These Terms of Service define the rules of the road for using our website and joining our programs. Please read them carefully — they're written in plain language on purpose."
      sections={sections}
    />
  );
}
