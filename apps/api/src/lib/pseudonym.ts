const ADJECTIVES = [
  "Discret",
  "Serein",
  "Vigilant",
  "Sobre",
  "Loyal",
  "Prudent",
  "Sincere",
  "Rigoureux",
  "Posé",
  "Franc",
];

const NOUNS = [
  "Faucon",
  "Cedre",
  "Oasis",
  "Boussole",
  "Phare",
  "Meridien",
  "Sirocco",
  "Atlas",
  "Zenith",
  "Vermeil",
];

/** Anonymous display name shown in chat/marketplace contexts before identity reveal. */
export function generatePseudonym(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${adjective}${noun}${suffix}`;
}
