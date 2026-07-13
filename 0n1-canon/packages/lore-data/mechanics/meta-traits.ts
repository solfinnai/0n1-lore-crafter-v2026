import type { StatDefinition, TypeTier, BackgroundResonance, DomainInfo } from "./types"

// Layer 1 (Background), Layer 6 (Spirit/Style/Strength stats), Type tiers,
// and Domain (K4M-1 House) data.
// From the Full ETH Trait List master sheet and the 0N1 Force Universe report.

export const statDefinitions: StatDefinition[] = [
  {
    category: "Spirit",
    statName: "Spirit",
    role: "Defense Stat",
    description:
      "Measures spiritual resilience, willpower, and capacity to resist psychic, spiritual, and emotional attacks. Governs resistance to Kabuki mind attacks, Hannya emotional manipulation, and possession attempts. Scale of 1-10.",
  },
  {
    category: "Style",
    statName: "Style",
    role: "Offense Stat",
    description:
      "Measures creative power expression, technique precision, and tactical execution. Governs critical hit potential, combo effectiveness, and power mastery ceiling. Scale of 1-10.",
  },
  {
    category: "Strength",
    statName: "Strength",
    role: "Power Stat",
    description:
      "Measures raw physical and energy output capacity. Governs damage output, durability of constructs, and power intensity. Scale of 1-10.",
  },
]

export const typeTiers: TypeTier[] = [
  {
    trait: "Y0K-A1",
    tierName: "Ghost Spirits (Yokai)",
    powerLevel: 1,
    share: "68% of population (5,278 NFTs)",
    description:
      "The general population with minimal mutations but subtle psychic or technological abilities. Enhanced cognitive capabilities or specialized sensory perceptions. Form the working class, responsible for much of day-to-day operations. Level 1 powers. For Citrine bodies: specialize in ONE elemental combo. For Azurite bodies: use and specialize in TWO emotions.",
  },
  {
    trait: "B4K3M0-N0",
    tierName: "Monster Forms (Bakemono)",
    powerLevel: 2,
    share: "27% of population (2,100 NFTs)",
    description:
      "The middle tier with moderate mutations and abilities. Physical enhancements and specialized adaptations suited for specific roles. Often serve as intermediaries between Demons and Ghost Spirits. Level 2 powers. For Citrine bodies: specialize in TWO elemental combination paths (fixed pairs). For Azurite bodies: use and specialize in FOUR emotions.",
  },
  {
    trait: "0N1",
    tierName: "Demons (0N1)",
    powerLevel: 3,
    share: "5% of population (392 NFTs)",
    description:
      "The elite ruling class with significant physical mutations and powerful abilities due to deep connection to the One Source. They possess the strongest direct connection and can manipulate its energy directly, accessing abilities that appear almost magical. Occupy positions of power and privilege. Level 3 powers.",
  },
  {
    trait: "K4M-1",
    tierName: "K4M-1 (Kami)",
    powerLevel: 4,
    share: "7 NFTs",
    description:
      "Seven godlike lords wielding divine powers from the One Source - the Emperor's most trusted generals, now heads of the seven Houses. God-tier Level 4 powers. (Ronin are elite Level 4 S-Tier Master Warriors operating independently outside any House.)",
  },
]

export const backgroundResonances: BackgroundResonance[] = [
  {
    trait: "Jasper",
    effect:
      "Earth-resonance defensive amplifier. Passive stat buff tied to One Source environmental fields.",
  },
  {
    trait: "Citrine",
    effect: "Elemental attunement during peak daylight. Passive stat buff.",
  },
  {
    trait: "Azurite",
    effect: "Emotional resonance during twilight/nighttime. Passive stat buff.",
  },
  {
    trait: "Dark Smoke",
    effect: "Passive shadow-stealth enhancement.",
  },
  {
    trait: "Light Smoke",
    effect: "Passive regeneration field.",
  },
  {
    trait: "Technogod",
    effect: "Passive data/signal amplification.",
  },
  {
    trait: "Technogod (Pearl)",
    effect: "Passive data/signal amplification (Pearl variant).",
  },
  {
    trait: "Technogod (Jasper)",
    effect: "Passive data/signal amplification (Jasper variant).",
  },
  {
    trait: "Technogod (Citrine)",
    effect: "Passive data/signal amplification (Citrine variant).",
  },
  {
    trait: "Technogod (Azurite)",
    effect: "Passive data/signal amplification (Azurite variant).",
  },
]

// The seven Domains correspond to the seven K4M-1 Houses and provide passive
// environmental/social bonuses.
export const domains: DomainInfo[] = [
  {
    trait: "War",
    house: "House of Inferno",
    houseNumber: "#01",
    philosophy: '"Through war, we rule."',
    bodyTypeAffinity: "Tiger Skin",
    divinePower: "Primal Overdrive",
    secret: "Believes the Emperor was betrayed and seeks vengeance.",
    bonus: "Combat damage caps (combat damage bonuses).",
  },
  {
    trait: "Moon",
    house: "House of Shadows",
    houseNumber: "#02",
    philosophy: '"The unseen hand rules the world."',
    bodyTypeAffinity: "Obsidian",
    divinePower: "Umbral Dominion",
    secret: "Knows something about the Emperor's disappearance.",
    bonus: "Darkness/shadow synergy.",
  },
  {
    trait: "Sun",
    house: "House of Radiance",
    houseNumber: "#03",
    philosophy: '"The truth is not seen, it is revealed."',
    bodyTypeAffinity: "Pearlescent",
    divinePower: "Supernova",
    secret: "Possesses a cryptic message from the Emperor.",
    bonus: "Solar/day synergies.",
  },
  {
    trait: "Art & Music",
    house: "House of Echoes",
    houseNumber: "#04",
    philosophy: '"The game was won before it began."',
    bodyTypeAffinity: "Kabuki",
    divinePower: "Symphony of Reality",
    secret: "Has foreseen the F4LL3N's return.",
    bonus: "Charm/sonic amplification.",
  },
  {
    trait: "Love",
    house: "House of Passion",
    houseNumber: "#05",
    philosophy: '"All things end. I do not."',
    bodyTypeAffinity: "Ash",
    divinePower: "Vitakinesis",
    secret: "Has discovered the forbidden ritual to become truly immortal.",
    bonus: "Ally-targeting buff.",
  },
  {
    trait: "Energy",
    house: "House of Vitalis",
    houseNumber: "#06",
    philosophy: '"All that exists is vibration."',
    bodyTypeAffinity: "Azurite",
    divinePower: "Primordial Tone",
    secret: "Has been experimenting on the One Source.",
    bonus: "Energy-projection amplification.",
  },
  {
    trait: "Creation",
    house: "House of Genesis",
    houseNumber: "#07",
    philosophy: '"Without balance, there is only ruin."',
    bodyTypeAffinity: "Type-01",
    divinePower: "Sourceforge Protocol",
    secret: "Holds the Emperor's last instructions.",
    bonus: "Crafting/construct bonuses.",
  },
]

// Mouth traits are personality flavor only (no powers):
// Uwu, Smirk, Smile, Open, Neutral, Frown, Angry, Angry (Oni)
export const mouthPersonalityNote =
  "Mouth traits carry no powers - they are personality flavor (e.g. Smirk, Frown, Neutral, Angry) that informs the character's demeanor."

// Helmet "-Divine" traits: Kami-related trait, meaning under canon development.
// Hair and Wear (clothing) traits are cosmetic metadata only.
