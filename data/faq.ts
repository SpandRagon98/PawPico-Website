export type FaqItem = {
  question: string;
  answer: string;
  links?: { label: string; href: string }[];
};

export const faqItems: FaqItem[] = [
  {
    question: "Will MewMuze slow down my PC?",
    answer:
      "MewMuze is designed as a lightweight desktop pet. It lowers its animation activity while resting, hidden or in full screen, so it is not trying to win a benchmark while you work.",
  },
  {
    question: "Does MewMuze read my screen?",
    answer:
      "No. It does not capture screenshots or read your documents. Desktop reactions use broad app context and activity signals, while Clipboard Assistant only sees text you explicitly copy after you turn that feature on.",
  },
  {
    question: "Does it work with more than one monitor?",
    answer:
      "Yes. MewMuze understands multiple Windows work areas and mixed display scaling, so the cat can move around without yeeting itself into the digital void.",
  },
  {
    question: "Will the cat interrupt presentations?",
    answer:
      "Peek Mode can automatically tuck MewMuze into a restrained corner during full-screen work and presentations. You can also control Peek Mode manually.",
  },
  {
    question: "Do I need to make an account?",
    answer:
      "No MewMuze account is required. Pay once, receive your licence key by email and activate the app on your PC. Very little ceremony. Maximum cat.",
  },
  {
    question: "What happens if I reinstall it or get a new PC?",
    answer:
      "A normal update keeps your activation. Reinstalling on the same PC usually keeps it when the secure Windows credential remains. A new computer counts as a new activation, and one licence supports up to three active devices.",
  },
  {
    question: "Is there a Mac version?",
    answer:
      "Not yet. MewMuze 0.1.8 is for Windows 10 and Windows 11. A Mac edition does not have a promised release date right now, so no mysterious countdown clock here.",
    links: [
      {
        label: "Check Windows 11 information",
        href: "https://www.microsoft.com/windows/windows-11",
      },
    ],
  },
  {
    question: "Does MewMuze work offline?",
    answer:
      "Core companion animations, reminders and local tools work offline after activation. Gmail, Calendar, checkout and update checks naturally need internet. Licence validation includes an offline grace period, so a temporary outage does not evict your cat.",
  },
  {
    question: "What does the one-time $7.99 include?",
    answer:
      "It includes the Windows app, the desktop pet, all current companion and productivity features, appearance controls and future app updates covered by the lifetime licence. Dodo Payments shows the configured regional price and available payment methods at checkout.",
  },
  {
    question: "My licence key did not arrive. What now?",
    answer:
      "Check spam and the Dodo Payments receipt first. If the inbox is still giving absolutely nothing, email support@mewmuze.com with your checkout email and payment ID. Never send your card number.",
    links: [
      { label: "Open MewMuze support", href: "/support/" },
      { label: "Visit Dodo Payments", href: "https://dodopayments.com/" },
    ],
  },
];
