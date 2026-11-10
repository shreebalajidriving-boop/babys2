export type GuidedTopic = {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
};

export const ASSISTANT_DISCLAIMER =
  'General guidance only. It does not replace advice from your child’s doctor.';

export const EMERGENCY_NOTE =
  'If your child is having trouble breathing, is very drowsy or hard to wake, has a seizure, or you are worried about their safety, call emergency services or go to the nearest hospital now.';

export const GUIDED_TOPICS: GuidedTopic[] = [
  {
    id: 'feeding',
    question: 'How often should I feed a newborn?',
    keywords: ['feed', 'feeding', 'milk', 'breast', 'formula', 'latch'],
    answer:
      'In the first weeks, most newborns feed every 2 to 3 hours, including overnight, so expect 8 to 12 feeds in 24 hours. Feed on demand and watch for hunger cues such as rooting, lip smacking or hands to mouth. Keep track of wet nappies: about 6 or more a day suggests they are getting enough. Talk to your doctor if feeds are very short, the baby is not gaining weight, or wet nappies drop off.',
  },
  {
    id: 'sleep',
    question: 'How much sleep does my baby need?',
    keywords: ['sleep', 'nap', 'bedtime', 'night', 'wake', 'waking'],
    answer:
      'Newborns sleep about 14 to 17 hours a day in short stretches. By 6 months, many babies sleep 12 to 15 hours in total, with night sleep lengthening. Placing your baby on their back to sleep on a firm, flat surface with no pillows or soft toys lowers the risk of sudden infant death. A simple, consistent bedtime routine helps older babies settle.',
  },
  {
    id: 'fever',
    question: 'When should I worry about a fever?',
    keywords: ['fever', 'temperature', 'feverish'],
    answer:
      'For a baby under 3 months, a temperature of 38 C (100.4 F) or higher needs a doctor the same day, even if they seem well. For older children, keep them comfortable, offer plenty of fluids and check on them regularly. See a doctor if the fever lasts more than 2 to 3 days, the child seems unusually unwell, has a rash that does not fade when pressed, or is not drinking. Do not give medicine without checking the correct dose for their weight and age.',
  },
  {
    id: 'teething',
    question: 'What helps with teething?',
    keywords: ['teeth', 'teething', 'gum', 'drool'],
    answer:
      'Teething often starts around 6 months and can cause drooling, chewing and a mildly raised temperature. Gentle gum massage with a clean finger, a chilled (not frozen) teething ring and offering cool foods can help. Fever, diarrhoea or a rash are not normal teething signs, so check with your doctor if they appear.',
  },
  {
    id: 'milestones',
    question: 'Is my child on track for milestones?',
    keywords: ['milestone', 'walk', 'walking', 'talk', 'talking', 'crawl', 'crawling', 'development', 'speech'],
    answer:
      'Children reach milestones at different speeds. As a rough guide: smiling by about 2 months, sitting with support by 6 months, first words around 12 months and walking by about 18 months. If your child has lost a skill they once had, or has not reached a milestone by the upper end of the range, raise it with your doctor sooner rather than waiting.',
  },
  {
    id: 'vaccines',
    question: 'Which vaccines are due next?',
    keywords: ['vaccine', 'vaccines', 'vaccination', 'shot', 'shots', 'immunisation', 'immunization', 'jab'],
    answer:
      'Routine vaccines follow a schedule that starts at birth and continues into the school years. Open the Vaccinations screen in Care and enter your child’s date of birth to see what is due now and what is coming up. Your doctor can confirm the timing for your child and arrange any catch-up doses.',
  },
];

const FALLBACK_ANSWER =
  'I can share general guidance on feeding, sleep, fevers, teething, milestones and vaccines. For anything else, especially if you are worried about your child, please speak to your doctor. You can book a consultation from the Care tab.';

export function answerFor(question: string): string {
  const text = question.toLowerCase();
  const match = GUIDED_TOPICS.find(
    (topic) => topic.question.toLowerCase() === text.trim() || topic.keywords.some((word) => text.includes(word)),
  );
  return match ? match.answer : FALLBACK_ANSWER;
}
