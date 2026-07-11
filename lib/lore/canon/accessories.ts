import type { CanonTraitPower } from "./types"

// Extra (accessories - Layer 4: utility, familiars, support), Eyes and Head
// traits (Layer 5: perception and minor powers).
// Transcribed from the Full ETH Trait List master sheet.

const oniDollPowers = {
  foundation: "Voodoo Puppetry",
  corePowers:
    "1. Soul Bind: The wearer can bind the soul of an Oni, Fallen, or Akuma to the Oni Doll, gaining complete control over them and their abilities until the bond is broken and the trapped soul leaves the doll. The soul can be ripped from a living being to trap within the doll; however, if the being's body is still alive, the soul will always want to return to its original body like a strong magnet. The weaker the being, the easier it is to trap and control the soul; the stronger the being, the harder. Once the soul is freed from the doll, it will try to immediately return to its body. Once the soul is taken from a being's body, the being's One Source powers or other powers are bound to the soul and are no longer usable by the being's body (only embers of their powers remain). " +
    "2. Warding Doll: The wearer can use the Oni Doll to create protective wards that repel negative energy or curses, shielding allies from harm. " +
    "3. Sentient Doll: The Oni Doll becomes sentient and acts independently to protect or assist the wearer, attacking enemies or defending against threats. " +
    "4. Spirit Vault: The ability to save someone's life force and spirit into a doll to save their soul - but there is currently no way to release a soul once bound to the Oni Doll, so this can also act as a prison. " +
    "5. Control Puppet: The wearer can control the movements or actions of the target by manipulating the Oni Doll, forcing them to fight on behalf of the wearer or perform tasks against their will.",
  notes:
    "There are no advanced abilities or powers for the doll. Part of the spirit interaction ecosystem: Oni Doll = CAPTURE souls (permanent imprisonment with prerequisite chain).",
}

export const extraPowers: CanonTraitPower[] = [
  {
    category: "Extra",
    trait: "Super Aura",
    quantity: 27,
    foundation: "Power Surge",
    corePowers:
      "Temporary Boost: The wearer can activate the Super Aura to temporarily boost all of their physical and mental abilities, making them faster, stronger, and more resilient. Intimidating Presence: The aura creates an intense, fearsome presence that can intimidate enemies and cause them to hesitate or flee; target movement speed is reduced, causing them to hesitate before each action. Increased Focus: The aura sharpens the wearer's mind, allowing them to process information faster, make quicker decisions, and anticipate enemy movements.",
    advancedPowers: [
      {
        name: "Hyper Mode",
        description:
          "The temporary boost becomes so powerful that the wearer enters a state of hyper mode, where they can perform superhuman feats and withstand even the most devastating attacks.",
      },
      {
        name: "Fear Incarnate",
        description:
          "The intimidating presence of the Super Aura evolves into a paralyzing fear that can stop enemies in their tracks, making them unable to act.",
      },
      {
        name: "Battlefield Commander",
        description:
          "The aura's increased focus extends to allies within its range, granting them heightened awareness and coordination, making the entire team more effective in combat.",
      },
    ],
  },
  {
    category: "Extra",
    trait: "Oni Doll (Jasper)",
    quantity: 267,
    ...oniDollPowers,
  },
  {
    category: "Extra",
    trait: "Oni Doll (Azurite)",
    quantity: 172,
    ...oniDollPowers,
  },
  {
    category: "Extra",
    trait: "Haunted",
    quantity: 5,
    foundation: "Spectral Haunting",
    corePowers:
      "Spirit Summoning: The wearer is constantly surrounded by a spirit that they can command to attack enemies with spiritual/psychological energy, or scout ahead. Spirit Knowledge/Vision/Insights: The spirits provide the wearer the ability to know about other spirits; the spirit can communicate with other spirits on their behalf, offering warnings about imminent danger or revealing an enemy's next move.",
    advancedPowers: [
      {
        name: "Poltergeist Mastery",
        description:
          "The spirits evolve into powerful poltergeists that can attack with spiritual, psychological, and physical force at greater intensity.",
      },
      {
        name: "Eternal Haunting",
        description:
          "The spirits bound to the wearer become more powerful and can continue to haunt enemies even after the wearer has left the area (within physical or time limitations), causing long-term psychological and physical effects.",
      },
    ],
    notes: "Part of the spirit interaction ecosystem: Haunted = COMMAND spirits (direct in combat, catch-and-evolve progression).",
  },
  {
    category: "Extra",
    trait: "Dark Aura",
    quantity: 44,
    foundation: "Corrupting Presence",
    corePowers:
      "Weakening Aura: Enemies within the aura's reach find their abilities weakened, their attacks less effective, and their defenses crumbling under the corrupting influence; target's healing capabilities and/or buffs and buff abilities are reduced when within range. Technology Override: The aura causes nearby technology to malfunction or shut down, giving the wearer an advantage in battles involving advanced weaponry or defenses. Life Drain: The Dark Aura allows the wearer to drain the life force of enemies who come too close, weakening them and transferring their strength to the wearer.",
    advancedPowers: [
      {
        name: "Total Corruption",
        description:
          "The wearer's Dark Aura becomes powerful enough to corrupt the very environment, turning allies of the enemy against them and causing structures to decay.",
      },
      {
        name: "Aura of Despair",
        description:
          "The aura induces a deep sense of despair in enemies, sapping their will to fight and making them more likely to surrender or retreat.",
      },
      {
        name: "Energy Absorption",
        description:
          "The wearer can absorb the energy from disrupted technology or drained life force, using it to power up their own abilities or heal themselves.",
      },
    ],
  },
  {
    category: "Extra",
    trait: "Canary",
    quantity: 12,
    foundation: "Information / Intuition Boost",
    corePowers:
      "Forecast Danger: The canary will sing different tunes based on the type of danger the owner will face in the foreseeable future. The tunes are faster when the danger is imminent and slower if the danger is further out. Spirit Taxi: The canary can grasp spirits with their talons and transport them to any location - whether as an act of good or malice, as an attack or in defense.",
    advancedPowers: [
      {
        name: "Perfect Forecasting",
        description:
          "The owner and the canary are in perfect sync - the owner's senses blend with the canary's senses, allowing the owner to perfectly understand and see what the canary is forecasting and sensing.",
      },
      {
        name: "Spirit Teleportation",
        description:
          "The canary can instantaneously teleport a spirit to (but not from) any location that the canary or owner have personally traveled to before.",
      },
    ],
    notes: "Part of the spirit interaction ecosystem: Canary = TRANSPORT spirits (move from A to B).",
  },
]

// Extras with no powers (metadata only)
export const extraMetadataTraits = [
  "Y0N1 Pin",
  "Strawberry Pin",
  "Lucky no. 7 Pin",
  "Lucky no. 7 Earring",
  "Loop Earring",
  "Earring (Double)",
  "Banana Pin",
  "0N1 Logo (White)",
  "0N1 Logo (Black)",
  "Void",
]

export const eyePowers: CanonTraitPower[] = [
  {
    category: "Eyes",
    trait: "Possessed",
    quantity: 89,
    foundation: "Spectral Sight",
    corePowers:
      "Spirit Communication: The wearer can see and communicate with spirits, ghosts, and other ethereal beings, gaining valuable information or assistance from the spirit world. Revealing Truth: The wearer can see through illusions, lies, and deceit, revealing the truth of any situation or person they encounter. Ethereal Vision: The wearer can perceive and interact with the spirit world, allowing them to detect hidden or invisible threats, such as ghosts or cursed objects.",
    advancedPowers: [
      {
        name: "Soul Binding",
        description:
          "The wearer gains the ability to bind spirits to objects or people, using them to protect or curse the target as needed.",
      },
      {
        name: "Necromantic Vision",
        description:
          "The wearer can see into the past by interacting with the spirits of the dead, gaining foresight or knowledge of past events.",
      },
      {
        name: "Spirit Armor",
        description:
          "The wearer can summon spirits to form a protective barrier around themselves, shielding them from both physical and spiritual harm.",
      },
    ],
    notes: "Part of the spirit interaction ecosystem: Possessed Eyes = SEE and BIND spirits (perception layer).",
  },
  {
    category: "Eyes",
    trait: "Hypnotized",
    quantity: 44,
    foundation: "Hypnosis",
    corePowers:
      "Thrall Stare: Induced dizziness and disorientation to disorient and control. Less about planting thoughts, more about dissolving the victim's ability to resist or think clearly.",
    advancedPowers: [
      {
        name: "Soul Leash",
        description:
          "Command your opponent's actions for a period of time through deeply implanted thoughts; can be used within the proximity of an enemy, and can be leveled up depending on power levels.",
      },
    ],
  },
  {
    category: "Eyes",
    trait: "Half Open (Oni)",
    quantity: 55,
    foundation: "Soul Sight",
    corePowers:
      "Eye of True Nature: They see the inner soul. Oni perceive the moral weight of a soul directly - what you actually are. No disguise, no reputation, no performance survives their gaze. This maps to true sight and seeing through illusions, deception, and false identity. Yomi Gate: They see across realms. Oni move between the living world and Jigoku (hell) - their eyes work in both. This maps to spirit vision, perceiving what is invisible to ordinary sight, including entities, intentions, and hidden things.",
  },
  {
    category: "Eyes",
    trait: "Angry (Oni)",
    quantity: 44,
    foundation: "Soul Sight",
    corePowers:
      "Eye of True Nature: They see the inner soul. Oni perceive the moral weight of a soul directly - what you actually are. No disguise, no reputation, no performance survives their gaze. This maps to true sight and seeing through illusions, deception, and false identity. The Reckoning Eye: They see life force. As death-adjacent beings they perceive vitality directly - they can see how much a person has, where it's weakest, how close to the threshold they are. This maps to vital reading and seeing the current state of a being's strength or proximity to death.",
    advancedPowers: [
      {
        name: "Yomi Gate",
        description:
          "They see across realms. Oni move between the living world and Jigoku (hell) - their eyes work in both. Spirit vision: perceiving what is invisible to ordinary sight, including entities, intentions, and hidden things.",
      },
      {
        name: "The Broken Gaze",
        description:
          "Their gaze is itself a weapon. The Oni stare causes 15-30 second paralysis, terror, and crippling mental and physical submission.",
      },
    ],
  },
  {
    category: "Eyes",
    trait: "Eyebags",
    quantity: 19,
    foundation: "Nightmare Fuel",
    corePowers:
      "Sleep Deprivation Aura: The wearer emits an aura that induces extreme fatigue, fog, and restlessness in those nearby, making it difficult for enemies to focus or fight; target's accuracy is reduced and power output slowly diminishes.",
    advancedPowers: [
      {
        name: "Nightmare Projection",
        description:
          "The wearer can project terrifying visions into the minds of their enemies, causing fear, extreme confusion, and even paralysis.",
      },
    ],
  },
]

// Eye traits with no powers (metadata only): all color variants of
// Squint, Open, Half Open, Eye Shadow, Angry, plus Flat, Closed Eye, Aggressive.
export const eyeMetadataTraits = [
  "Squint (Jasper)", "Squint (Citrine)", "Squint (Azurite)",
  "Open (Jasper)", "Open (Citrine)", "Open (Azurite)",
  "Half Open (Jasper)", "Half Open (Citrine)", "Half Open (Azurite)",
  "Eye Shadow (Jasper)", "Eye Shadow (Citrine)", "Eye Shadow (Azurite)",
  "Angry (Jasper)", "Angry (Citrine)", "Angry (Azurite)",
  "Flat", "Closed Eye", "Aggressive",
]

export const headPowers: CanonTraitPower[] = [
  {
    category: "Head",
    trait: "Horns (Obsidian)",
    quantity: 60,
    foundation: "Oni-Kuma",
    corePowers:
      "Blood Ritual: Ability to use one's own blood to tag symbols or create curses, or pull blood-based weapons from the Akuma's realm. The more you use it, the more you deplete your own One Source - and extended use will corrupt you.",
    advancedPowers: [
      {
        name: "Blood Rain",
        description: "Use blood as a weapon, such as blood rain or a blood tornado.",
      },
    ],
    drawbacks: "Depletes the user's own One Source; extended use will corrupt the user.",
  },
  {
    category: "Head",
    trait: "Horns (Gold)",
    quantity: 34,
    foundation: "Oni-Kuma",
    corePowers:
      "Blood Ritual: Ability to use one's own blood to tag symbols or create curses, or pull blood-based weapons from the Akuma's realm. The more you use it, the more you deplete your own One Source - and extended use will corrupt you. Hex Vision: The character can see all active curses, hexes, spiritual bindings, and dark workings placed on people or locations. They read them like text, knowing who placed them, what they do, and how to unravel or amplify them.",
    advancedPowers: [
      {
        name: "Blood Rain",
        description: "Use blood as a weapon, such as blood rain or a blood tornado.",
      },
      {
        name: "The Rewriter",
        description:
          "The character doesn't just read curses - they edit them. They can take any curse placed by anyone and rewrite its target, its effect, its duration, or its source. A curse meant to destroy an enemy becomes a curse that protects them instead. A binding placed on a spirit gets redirected onto its caster. They are the supreme authority over all dark workings because no working is outside their ability to revise.",
      },
    ],
    drawbacks: "Depletes the user's own One Source; extended use will corrupt the user.",
  },
  {
    category: "Head",
    trait: "E-A1D",
    quantity: 63,
    foundation: "Echo Location",
    corePowers:
      "Enhanced Hearing: The wearer gains superhuman hearing, capable of detecting even the faintest sounds across great distances - pinpointing enemy locations, eavesdropping on conversations, and detecting hidden threats. Sound Navigation: The wearer can navigate through complete darkness or visually obscured environments by using sound waves to create a mental map of their surroundings. Sonic Pulse: The wearer can emit a pulse of sound that bounces off surfaces, revealing hidden enemies or objects and allowing them to target with precision.",
    advancedPowers: [
      {
        name: "Hyper Sensitivity",
        description:
          "The wearer's hearing becomes so acute that they can detect lies through changes in heartbeat or breathing patterns, making them nearly impossible to deceive.",
      },
      {
        name: "Echokinetic Combat",
        description:
          "The wearer gains the ability to use sound waves as a weapon, creating focused sonic pulses that can knock back or disorient enemies during combat.",
      },
      {
        name: "Echo Vision",
        description:
          "The wearer can fully visualize their surroundings through sound, gaining 360-degree awareness and eliminating all blind spots, even when completely obscured.",
      },
    ],
  },
  {
    category: "Head",
    trait: "Antlers (Gold)",
    quantity: 29,
    foundation: "Nature's Wisdom",
    corePowers:
      "Natural Perception: The wearer gains an intuitive understanding of nature, allowing them to communicate with animals, sense changes in the environment, and detect natural phenomena before they occur. Plant Manipulation: The wearer can control and manipulate plant life, causing rapid growth, creating barriers, or using vines and roots to ensnare enemies. Nature's Touch: The wearer can heal the wounds of others when in contact with natural elements from the Earth that are in their true, unaltered, and uncorrupted form.",
    advancedPowers: [
      {
        name: "Forest Guardian",
        description:
          "The wearer can summon and command the spirits of the forest, creating an army of natural guardians to protect or fight alongside them.",
      },
      {
        name: "Nature's Fury",
        description:
          "The wearer's control over plant life evolves into full environmental manipulation, allowing them to control weather patterns, cause earthquakes, or create massive, destructive forces from the natural world.",
      },
      {
        name: "Gaia's Blessing",
        description:
          "The wearer gains the ability to heal the land, restoring damaged ecosystems, purifying polluted areas, and bringing life to barren environments.",
      },
    ],
  },
]

// Head traits with no powers (metadata only)
export const headMetadataTraits = [
  "Snapback (Pearl)", "Snapback (Obsidian)", "Snapback (Multicolor)", "Snapback (Jasper)",
  "Rose", "Pen", "Headset",
  "Headphones (Turquoise)", "Headphones (Rose)", "Headphones (Pearl)", "Headphones (Obsidian)", "Headphones (Jasper)", "Headphones (Citrine)",
  "Flat Cap (Pearl)", "Flat Cap (Obsidian)",
  "Fedora (Obsidian)", "Fedora (Charcoal)",
  "Earbuds", "Crown", "Cat Ears (Cool)", "Cat Ears",
  "-Headphones (Pearl)", "-Headphones (Obsidian)", "Void",
]
