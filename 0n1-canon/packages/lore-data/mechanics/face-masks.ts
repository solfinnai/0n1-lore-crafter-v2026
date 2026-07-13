import type { CanonTraitPower } from "./types"

// Face traits (masks) - Layer 3: tactical specialization providing secondary
// power sets that complement the body type.
// Transcribed from the Full ETH Trait List master sheet.

export const faceMaskPowers: CanonTraitPower[] = [
  {
    category: "Face",
    trait: "VR (Pearl)",
    quantity: 27,
    foundation: "Reality Warp",
    corePowers:
      "Simulated Environment: The wearer can create realistic virtual environments overlaid onto the physical world, trapping enemies in an illusion where they can control every aspect. Virtual Constructs: The wearer can summon digital constructs that interact with the physical world, such as barriers, weapons, or avatars that fight alongside them.",
    advancedPowers: [
      {
        name: "Full Immersion",
        description:
          "The wearer's virtual environments become so convincing that enemies struggle to distinguish between the simulation and reality, making it nearly impossible for them to break free.",
      },
      {
        name: "Digital Phantoms",
        description:
          "The virtual constructs evolve to become semi-autonomous, capable of independent action and capable of affecting the physical world more directly.",
      },
    ],
  },
  {
    category: "Face",
    trait: "VR (Obsidian)",
    quantity: 19,
    foundation: "Reality Warp",
    corePowers:
      "Simulated Environment: The wearer can create realistic virtual environments overlaid onto the physical world, trapping enemies in an illusion where they can control every aspect. Virtual Constructs: The wearer can summon digital constructs that interact with the physical world, such as barriers, weapons, or avatars that fight alongside them. Perception Manipulation: The wearer can alter the perception of reality for others, making them see or experience things that aren't there, leading to confusion or fear.",
    advancedPowers: [
      {
        name: "Full Immersion",
        description:
          "The wearer's virtual environments become so convincing that enemies struggle to distinguish between the simulation and reality, making it nearly impossible for them to break free.",
      },
      {
        name: "Digital Phantoms",
        description:
          "The virtual constructs evolve to become semi-autonomous, capable of independent action and capable of affecting the physical world more directly.",
      },
      {
        name: "Reality Blend",
        description:
          "The wearer can blend virtual and physical realities, creating a hybrid space where the laws of physics can be bent or broken at will.",
      },
    ],
  },
  {
    category: "Face",
    trait: "V-Shades",
    quantity: 193,
    foundation: "Nano-powered Vision",
    corePowers:
      "X-Ray Vision: The wearer can see through walls and detect hidden objects, traps, or enemies. Looking From Within: The wearer can see through the eyes of anybody who has been seen and analyzed by the nanobots inside the V-Shades no matter the distance the target is away from the wearer. The further away the target, the shorter the time the wearer gets to glimpse through the target's eyes; the closer the target, the longer. The stronger the target, the shorter the time; the weaker the target, the longer.",
    advancedPowers: [
      {
        name: "Optic Blast",
        description:
          "The wearer can focus their vision into a concentrated energy blast, capable of piercing through most materials.",
      },
      {
        name: "Omniscient Sight",
        description:
          "The wearer gains 360-degree vision, eliminating blind spots and allowing them to detect threats from any direction.",
      },
    ],
  },
  {
    category: "Face",
    trait: "Tengu Mask (Gold)",
    quantity: 38,
    foundation: "Enhanced Fighting, Martial Arts Mastery & Wind Mastery",
    corePowers:
      "Enhanced Fighting Abilities: The ability to adapt to any fighting style, increase speed, strength, stamina. Martial Arts Mastery: Enhanced combat abilities, particularly in swordsmanship, with the ability to anticipate and counter enemies' moves. Wind Mastery: Control over powerful gusts of air to alter the trajectory of projectile weapons or bullets, fire air bullets, throw strikes with compressed air, and emit strong wind vortexes to use offensively or defensively.",
    advancedPowers: [
      {
        name: "Tengu Swordmaster",
        description:
          "The wearer's combat prowess becomes legendary, with their strikes becoming nearly impossible to block or counter. Their sword can also channel wind energy to extend the range of their attacks.",
      },
      {
        name: "Guardian of the Sacred",
        description:
          "The wearer gains the ability to purify and protect sacred sites with divine energy, becoming nearly invincible when defending such locations.",
      },
      {
        name: "Possess the Sky",
        description:
          "Sprout pearlescent wings to allow the wearer to take flight and reign terror from above; attack with heavy feather projectiles or sweep in with a spinning vortex-like attack. (Gold-only.)",
      },
    ],
  },
  {
    category: "Face",
    trait: "Tengu Mask",
    quantity: 241,
    foundation: "Enhanced Physical Abilities, Storm's Wrath and Divine Protection",
    corePowers:
      "Enhanced Fighting Abilities: The ability to adapt to any fighting style, increase speed, strength, stamina.",
    advancedPowers: [
      {
        name: "Tengu Swordmaster",
        description:
          "The wearer's combat prowess becomes legendary, with their strikes becoming nearly impossible to block or counter. Their sword can also channel wind energy to extend the range of their attacks.",
      },
    ],
  },
  {
    category: "Face",
    trait: "T-Goggles",
    quantity: 163,
    foundation: "Analyzer & Overseer",
    corePowers:
      "Weak Point Detection: The wearer can identify weak points in enemies or structures, allowing them to strike for maximum damage. Analyze: The wearer can scan an enemy to view their level of health and their metadata (strength, speed, and power) to better understand the opponent being faced.",
    advancedPowers: [
      {
        name: "Perfect Aim",
        description:
          "The wearer's precision reaches a level where they can strike critical weak points with consistent near-perfect accuracy, regardless of distance or obstacles.",
      },
      {
        name: "All-Knowing",
        description:
          "The wearer is able to scan for all possible future outcomes of the target based off of predictive analysis, but each use of this power greatly shortens the One Source energy levels of the wearer.",
      },
    ],
    drawbacks: "Each use of All-Knowing greatly shortens the wearer's One Source energy levels.",
  },
  {
    category: "Face",
    trait: "Skull Mask",
    quantity: 235,
    foundation: "Death's Embrace",
    corePowers:
      "Life Siphon: The wearer can drain life energy from enemies with each strike, healing themselves while weakening their opponents. Fear Aura: The wearer exudes an aura of dread, causing enemies to falter in battle, making them easier to defeat. Strength from Death: Each defeated enemy strengthens the wearer, increasing their physical power and resilience (stacking per kill, capped at 5).",
    advancedPowers: [
      {
        name: "Grim Reaper's Touch",
        description:
          "The wearer's life siphoning becomes so potent that they can drain the life force of multiple enemies at once, significantly increasing their strength and vitality.",
      },
      {
        name: "Terror Incarnate",
        description:
          "The fear aura intensifies, causing enemies to flee in terror or become paralyzed with fear, rendering them helpless.",
      },
      {
        name: "Undying",
        description:
          "The wearer becomes incredibly difficult to kill, with each life they drain adding to their own longevity and invulnerability (95% damage reduction maximum).",
      },
    ],
  },
  {
    category: "Face",
    trait: "Ra Mask",
    quantity: 7,
    foundation: "Sun's Wrath",
    corePowers:
      "Solar Beams: The wearer can shoot concentrated beams of solar energy, capable of piercing through most materials and incinerating enemies. Blinding Flashes: The wearer can create intense flashes of light that blind and disorient enemies, making them vulnerable to follow-up attacks. Solar Flare Summoning: The wearer can summon miniature solar flares, creating explosions of heat and light that cause widespread damage.",
    advancedPowers: [
      {
        name: "Solar Nova",
        description:
          "The wearer can unleash a devastating solar nova, an explosion of solar energy that incinerates everything within a certain radius, leaving nothing but ash.",
      },
      {
        name: "Sun God's Blessing",
        description:
          "The wearer can call upon the sun's power to heal and empower themselves and their allies, granting them the strength and resilience of the sun itself. Includes ONE permanent death reversal per lifetime (resurrection mythology).",
      },
      {
        name: "Eternal Daylight",
        description:
          "The wearer can create an area of perpetual daylight, where the sun's energy constantly rejuvenates and empowers them while weakening enemies who thrive in darkness. (Directly counters Obsidian shadow powers.)",
      },
    ],
  },
  {
    category: "Face",
    trait: "PR Mask (Citrine)",
    quantity: 412,
    foundation: "Respiration Powers",
    corePowers:
      "Atmosphere Reading: The mask's filtration system becomes so attuned it can detect chemical signatures in the air - adrenaline, pheromones, fear compounds, blood. The wearer essentially reads the emotional and physical state of everyone nearby through what they're secreting into the air around them.",
    advancedPowers: [
      {
        name: "Akashic Breath",
        description:
          "The mask has filtered so much atmospheric data over time that the wearer no longer just reads the present state of a room - they read its history. Every emotion, every conversation, every act of violence that ever occurred in a space left chemical traces in the air. The wearer walks into a building and knows everything that happened there. They stand near a person and read every emotional state that person has ever been in - fear, guilt, desire, grief - layered like sediment.",
      },
    ],
  },
  {
    category: "Face",
    trait: "PR Mask (Jasper)",
    quantity: 389,
    foundation: "Respiration Powers",
    corePowers:
      "Disorienting Shockwave: The wearer can pull the mask aside to emit a loud noise that rattles an opponent's eardrums, throwing off the opponent's sense of balance.",
    advancedPowers: [
      {
        name: "Sonic Boom",
        description:
          "The wearer can pull the respiratory training mask aside to emit a loud and powerful shockwave of compressed air that hits the ground/target as a sudden, loud boom, like an explosion or thunderclap. The wearer's sonic blasts become so powerful that they can shatter solid objects, break through barriers, and cause severe damage to opponents.",
      },
    ],
  },
  {
    category: "Face",
    trait: "PR Mask (Turquoise)",
    quantity: 258,
    foundation: "Respiration Powers",
    corePowers:
      "Entrainment: The wearer identifies a target's breathing pattern and heart rate through atmospheric chemical detection. Once locked, their own body begins to mirror it with perfect precision. The moment the mirror is complete - the sync activates. The target's autonomic nervous system begins to bleed into the wearer's and vice versa. A two-way biological channel opens (this can also be a detriment to the PR mask user).",
    advancedPowers: [
      {
        name: "The Last Breath",
        description:
          "The mask has absorbed the final exhales of the fallen, absorbing a small part of their powers or One Source energy to be re-released as an attack or defense.",
      },
    ],
    drawbacks: "Entrainment opens a two-way biological channel that can also harm the wearer.",
  },
  {
    category: "Face",
    trait: "PR Mask (Charcoal)",
    quantity: 194,
    foundation: "Respiration Powers + Anarchic Influence",
    corePowers:
      "X Marks the Spot: The wearer can use any artistic tool to tag a singular site to create offensive or defensive support/buffs. The tag will last for a limited amount of time until it vanishes, at which point the wearer can elect to tag something new or tag the same site.",
    advancedPowers: [
      {
        name: "X Marks It All",
        description:
          "The wearer can use any artistic tool to tag an unlimited amount of sites at any given time to create offensive or defensive support/buffs. The tags last in correlation to the wearer's Style (spirit score).",
      },
    ],
  },
  {
    category: "Face",
    trait: "Plague Mask (Pearl)",
    quantity: 66,
    foundation: "Toxic Emissions & Nano Particle Control",
    corePowers:
      "Nano Swarm: The wearer can release a swarm of nanobots that can infiltrate enemies' bodies, disrupting their biological functions or enhancing the toxicity of the gases they emit. The nanobots can also repair the wearer's gear or perform reconnaissance by infiltrating enemy systems. Zone of Decay: The wearer can create an area where the environment becomes hostile, with plants withering and technology malfunctioning due to the toxic presence. (BIOLOGICAL nanobots - distinct from Type-01's TECHNOLOGICAL nanobots.)",
    advancedPowers: [
      {
        name: "Self-Replicating Nanobots",
        description:
          "The wearer's nanobots evolve to become self-replicating, allowing them to multiply and spread rapidly. This increases the scale and impact of their nano-plagues or the effectiveness of their molecular disassembly, making them nearly unstoppable.",
      },
      {
        name: "Corruption Catalyst",
        description:
          "The wearer's touch can now spread a rapidly growing corruption that consumes and decays entire structures or groups of enemies.",
      },
    ],
    counters: "Gas Mask counters Plague Mask toxins.",
  },
  {
    category: "Face",
    trait: "Plague Mask (Obsidian)",
    quantity: 310,
    foundation: "Toxic Emissions & Nano Particle Control",
    corePowers:
      "Poisonous Gas Emission: The wearer can release various toxic gases that incapacitate or kill enemies, including neurotoxins and corrosive clouds. Corrupting Touch: Anything the wearer touches becomes contaminated, causing it to decay or become toxic to others.",
    advancedPowers: [
      {
        name: "Death Fog",
        description:
          "The wearer's gas emissions become more potent, able to cover large areas with a lethal fog that corrodes metal, flesh, and anything it touches.",
      },
      {
        name: "Pestilence Aura",
        description:
          "The wearer exudes an aura of sickness that weakens and disorients anyone within proximity, draining their life force and spreading diseases.",
      },
    ],
    counters: "Gas Mask counters Plague Mask toxins.",
  },
  {
    category: "Face",
    trait: "Mempo Mask (Obsidian)",
    quantity: 114,
    foundation: "Honor's Judgement",
    corePowers:
      "Impenetrable Aura: The wearer is surrounded by an aura of honor that blocks deceitful attacks, including illusions, psychological manipulation, and treachery. This aura also protects against physical strikes, deflecting attacks with a forcefield of pure resolve (physical defense is weaker than spiritual/psychological).",
    advancedPowers: [
      {
        name: "Divine Justice",
        description:
          "The wearer's aura evolves to the point where it can reflect attacks back at the aggressor, turning their own force against them.",
      },
    ],
    drawbacks:
      "If the wearer commits a dishonorable act, ALL honor powers are disabled for the encounter.",
  },
  {
    category: "Face",
    trait: "Mempo Mask (Jasper)",
    quantity: 36,
    foundation: "Honor's Judgement",
    corePowers:
      "Impenetrable Aura: The wearer is surrounded by an aura of honor that blocks deceitful attacks, including illusions, psychological manipulation, and treachery. This aura also protects against physical strikes, deflecting attacks with a forcefield of pure resolve (physical defense is weaker than spiritual/psychological). Quick Draw: During a situation where atrocities are being committed and justice needs to be served, the wearer can keep their weapon holstered or sheathed, allowing the weapon to be bathed and saturated in honor; the wearer's weapon draw speed is directly correlated to how long their weapon has been holstered - the longer it bathes in honor, the faster the wearer can strike in the name of justice. Uses One Source to power up.",
    advancedPowers: [
      {
        name: "Divine Justice",
        description:
          "The wearer's aura evolves to the point where it can reflect attacks back at the aggressor, turning their own force against them.",
      },
      {
        name: "Scales of Virtue",
        description:
          "Leveling up Quick Draw: how long the wearer leaves their weapon holstered or sheathed directly correlates to the draw speed of the weapon, while also adding a secondary impact of judgement in the form of an invisible force that strikes immediately following the physical strike/shot of the weapon.",
      },
    ],
    drawbacks:
      "If the wearer commits a dishonorable act, ALL honor powers are disabled for the encounter.",
  },
  {
    category: "Face",
    trait: "Mech Mask",
    quantity: 21,
    foundation: "Nano Forge",
    corePowers:
      "Armament: Using nano tech to create attached weapons or tools on the body such as guns or blades, limited to what you can carry.",
    advancedPowers: [
      {
        name: "Max Overhaul",
        description: "Ability to form a full body oni armor suit (like Iron Man).",
      },
      {
        name: "Ghost Pilot",
        description:
          "Call and control your full frame mech externally so you don't have to be inside.",
      },
    ],
  },
  {
    category: "Face",
    trait: "Masquerade (Pearl)",
    quantity: 77,
    foundation: "Stealth, Persona Change",
    corePowers:
      "The Overlooked: For a fraction of time, can shadow step and move undetected.",
    advancedPowers: [
      {
        name: "Blind Spot",
        description:
          "The wearer permanently exists in everyone's peripheral vision and never centers.",
      },
    ],
  },
  {
    category: "Face",
    trait: "Masquerade (Obsidian)",
    quantity: 172,
    foundation: "Stealth, Persona Change",
    corePowers:
      "Physical Mimicry: Ability to mimic voice or appearance for a short period of time.",
    advancedPowers: [
      {
        name: "Soul Mirror",
        description:
          "When close to a subject, can absorb their memories / physical powers for a limited time, but can't mirror One Source powers.",
      },
    ],
  },
  {
    category: "Face",
    trait: "KULT Mask (Pearl)",
    quantity: 498,
    foundation: "Collective Consciousness",
    corePowers:
      "Shared Knowledge: The wearer can access the collective memories, thoughts, and skills of all who have worn the mask, granting them knowledge and abilities they haven't personally learned. Telepathic Network: The wearer can establish a mental link with other KULT mask wearers, allowing for silent communication and the coordination of complex strategies without verbal commands.",
    advancedPowers: [
      {
        name: "Memory Integration",
        description:
          "The wearer can fully integrate the skills and experiences of past mask wearers, effectively becoming a composite of all their knowledge, even adopting their fighting styles and strategies.",
      },
      {
        name: "Psychic Defense",
        description:
          "The telepathic network can be used to create a mental shield, protecting the wearer and their allies from psychic attacks or mental manipulation.",
      },
    ],
  },
  {
    category: "Face",
    trait: "KULT Mask (Obsidian)",
    quantity: 371,
    foundation: "Collective Consciousness",
    corePowers:
      "Shared Knowledge: The wearer can access the collective memories, thoughts, and skills of all who have worn the mask, granting them knowledge and abilities they haven't personally learned. Adaptive Combat: By tapping into the collective experience of past battles, the wearer can expand their combat abilities based on pulling past knowledge, giving them a combat advantage against opponents (pattern recognition, NOT true future sight).",
    advancedPowers: [
      {
        name: "Memory Integration",
        description:
          "The wearer can fully integrate the skills and experiences of past mask wearers, effectively becoming a composite of all their knowledge, even adopting their fighting styles and strategies.",
      },
      {
        name: "Expanded Adaptive Combat",
        description:
          "For a limited period of time and within a radius, adaptive combat can be shared with the team to increase their combat intelligence.",
      },
    ],
  },
  {
    category: "Face",
    trait: "Kitsune Mask (Pearl)",
    quantity: 488,
    foundation: "Fox Spirit",
    corePowers:
      "Magnetic Navigation: The wearer can use the Earth's magnetic field to pinpoint a single target, acting like an \"augmented reality\" system.",
    advancedPowers: [
      {
        name: "Eye of Providence",
        description:
          "The wearer can use the Earth's magnetic field to pinpoint an unlimited amount of targets simultaneously, acting like an all-seeing eye.",
      },
    ],
  },
  {
    category: "Face",
    trait: "Kitsune Mask (Obsidian)",
    quantity: 199,
    foundation: "Fox Spirit",
    corePowers:
      "Night Vision: The wearer's pupil of one eye turns into a vertical slit allowing them to see clearly in complete darkness, giving them an advantage in low-light or nighttime conditions (the drawback is that the other eye needs to remain closed to fully gain the night vision, which narrows the wearer's field of vision).",
    advancedPowers: [
      {
        name: "Clever Copy",
        description:
          "During the night hours, both of the wearer's pupils turn into vertical slits granting them the ability to create temporary replicas of any opponent's innate powers (i.e. replicating One Source powers). HARD LIMITATIONS: 30-second max, must have observed the power, cannot copy Ash temporal powers.",
      },
    ],
    drawbacks:
      "Night Vision requires the other eye to remain closed, narrowing the field of vision. Clever Copy: 30-second max, must have observed the power, cannot copy Ash temporal powers.",
  },
  {
    category: "Face",
    trait: "Kitsune Mask (Gold)",
    quantity: 33,
    foundation: "Fox Spirit",
    corePowers:
      "Magnetic Navigation: Use the Earth's magnetic field to pinpoint a single target, like an \"augmented reality\" system. Night Vision: One pupil turns into a vertical slit allowing clear sight in complete darkness (the other eye must remain closed, narrowing the field of vision). Fortune of the Fox: The wearer can summon a slot machine that can be pulled to reveal powers granted to the wearer depending on the series of images that fall into place. Powers temporarily gained are either 1. enhanced speed and agility, 2. silent assassin (perfectly silent and invisible for 60 seconds), 3. fox spirit guardian (randomly appearing as an orange fire fox, golden lightning fox, blue ice fox, green stone fox, or purple venom fox), 4. infinite fangs (an unlimited amount of daggers can be called upon and flung at an opponent), 5. double trouble (creates a perfect illusionary replica of the wearer that can deal damage to an opponent).",
    advancedPowers: [
      {
        name: "Eye of Providence",
        description:
          "Use the Earth's magnetic field to pinpoint an unlimited amount of targets simultaneously, acting like an all-seeing eye.",
      },
      {
        name: "Clever Copy",
        description:
          "During the night hours, both pupils turn into vertical slits granting the ability to create temporary replicas of any opponent's innate powers (i.e. replicating One Source powers).",
      },
      {
        name: "Foxfire's Fate",
        description:
          "The wearer can temporarily call upon any of the specific powers from the Fortune of the Fox slot machine. This power can be leveled up over time - from calling upon one Foxfire power at a time, to two at once, to three at once, up to all nine powers at once (reaching the pinnacle of this power to resemble the nine-tailed fox).",
      },
    ],
  },
  {
    category: "Face",
    trait: "Hannya Mask (Pearl)",
    quantity: 50,
    foundation: "Inward Emotion Powers",
    corePowers:
      "Compassionate Power (controllable): Use one's own One Source energy to shield others emotionally. These masks start with a passive core power; when consciously activated it turns into an evolution path, and the max evolution is a debuff to everyone around within a radius for a period of time.",
    advancedPowers: [
      {
        name: "Sympathetic Power (moderately controllable)",
        description: "Combine One Source energies to increase shields.",
      },
      {
        name: "Pitying Power (uncontrollable)",
        description:
          "Take someone's One Source energy without their permission - even taking energy from friends. Can't control it.",
      },
    ],
    drawbacks: "Power scales inversely with control - the max evolution is uncontrollable.",
  },
  {
    category: "Face",
    trait: "Hannya Mask (Obsidian)",
    quantity: 17,
    foundation: "Inward Emotion Powers",
    corePowers:
      "Sadness Power (controllable): Passive - you channel sadness into focused precision and energy. These masks start with a passive core power; when consciously activated it turns into an evolution path, and the max evolution is a debuff to everyone around within a radius for a period of time.",
    advancedPowers: [
      {
        name: "Misery Power (moderately controllable)",
        description: "Make other targeted people feel misery and debuff them.",
      },
      {
        name: "Despair Power (uncontrollable)",
        description:
          "Makes others unable to access their One Source energy for a period of time, and makes everyone in a radius feel despair - even friendlies.",
      },
    ],
    drawbacks: "Power scales inversely with control - the max evolution is uncontrollable.",
  },
  {
    category: "Face",
    trait: "Hannya Mask (Jasper)",
    quantity: 106,
    foundation: "Inward Emotion Powers",
    corePowers:
      "Jealousy Power (controllable): When wearing the mask, the passive power is immunity to jealousy/comparison - staying calm and objective. Activating the mask triggers the evolution path. These masks start with a passive core power; the max evolution is a debuff to everyone around within a radius for a period of time.",
    advancedPowers: [
      {
        name: "Rage Power (moderately controllable)",
        description: "Increased strength and speed, resistance to pain.",
      },
      {
        name: "Berserk Power (uncontrollable)",
        description:
          "Intelligence disappears and the wearer becomes impervious to pain, tapping into a primal state - damaging to self and others around, and drains life force heavily during usage.",
      },
    ],
    drawbacks:
      "Power scales inversely with control. Berserk state is damaging to self and allies and heavily drains life force.",
  },
  {
    category: "Face",
    trait: "Gas Mask (Pearl)",
    quantity: 7,
    foundation: "Environmental Immunity",
    corePowers:
      "Toxin Resistance: The wearer becomes immune to all forms of toxins, including poisonous gases, radiation, and harmful chemicals. They can move through hazardous environments without being affected. Toxin Absorption: The wearer can absorb toxins from their surroundings or from attacks, neutralizing them and even using them to fuel their own abilities. Controlled Release: The absorbed toxins can be released at will, either in a concentrated form as a weapon against enemies or as a protective cloud that deters attackers.",
    advancedPowers: [
      {
        name: "Hazardous Aura",
        description:
          "The wearer can project an aura that automatically neutralizes environmental hazards within a certain radius, making the area safe for allies while further empowering themselves.",
      },
      {
        name: "Toxic Projection",
        description:
          "The wearer gains the ability to manipulate absorbed toxins, shaping them into various forms, such as toxic projectiles, corrosive barriers, or debilitating clouds.",
      },
      {
        name: "Toxic Infusion",
        description:
          "The wearer's body becomes capable of infusing toxins into their physical attacks, adding a corrosive or poisonous effect to every strike.",
      },
    ],
    notes: "Counters the Plague Mask's toxins.",
  },
  {
    category: "Face",
    trait: "Gas Mask (Obsidian)",
    quantity: 107,
    foundation: "Environmental Immunity",
    corePowers:
      "Toxin Resistance: The wearer becomes immune to all forms of toxins, including poisonous gases, radiation, and harmful chemicals. They can move through hazardous environments without being affected. Toxin Absorption: The wearer can absorb toxins from their surroundings or from attacks, neutralizing them and even using them to fuel their own abilities.",
    advancedPowers: [
      {
        name: "Toxic Mastery",
        description:
          "The wearer gains the ability to manipulate absorbed toxins, shaping them into various forms, such as toxic projectiles, corrosive barriers, or debilitating clouds.",
      },
      {
        name: "Toxic Infusion",
        description:
          "The wearer's body becomes capable of infusing toxins into their physical attacks, adding a corrosive or poisonous effect to every strike.",
      },
    ],
    notes: "Counters the Plague Mask's toxins.",
  },
  {
    category: "Face",
    trait: "Garou (Jasper)",
    quantity: 122,
    foundation: "Creature Instinct - Mammals",
    corePowers:
      "CREATURE INSTINCT: The wearer's physical abilities and senses are modified and enhanced depending on the predator that is called upon. The wearer can initially call upon 1-2 predators, but with leveling can call upon up to 10 predators. The three Garou masks each cover one category of creature; Garou (Jasper) covers MAMMALS. For each mask, the Core Power is a PASSIVE ability from the animal called upon, and the Evolution Path built on top is the ACTIVE power. Passive powers: Gorilla: Dominant Presence (hierarchy felt); Bear: Hibernation Constitution (stamina recovers faster); Panther: Silent Approach (increased silence in movement); Cheetah: Launch Coil (stillness stores speed); Wolverine: Spite Constitution (pain suppressed); Mongoose: Venom Read (toxin immunity in the blood); Wolf: Pack Signal (increased positional awareness); Elephant: Immovable Base (cannot be displaced); Rhino: Forward Armor (front facing damage reduced); Lion: Territory Awareness (battlefield read always active).",
    advancedPowers: [
      { name: "Gorilla: Knuckle Load", description: "Two-handed crater strike." },
      { name: "Bear: Standing Maul", description: "Full body into one devastating strike." },
      { name: "Panther: Ceiling Drop", description: "Repositioned ambush from above." },
      { name: "Cheetah: Blitz Run", description: "Single direction instant close." },
      { name: "Wolverine: Attrition Lock", description: "Grapple that will not release." },
      { name: "Mongoose: Strike Window", description: "Counter precision into the opening." },
      { name: "Wolf: Pursuit Lock", description: "Locks opponent signature and tracks over long distances." },
      { name: "Elephant: Freight Charge", description: "Momentum carries through multiple targets." },
      { name: "Rhino: Horn Drive", description: "Penetrates defense through powerful single point strike." },
      { name: "Lion: Pride Roar", description: "Loud roar to momentarily freeze opponents and gain opportunity for first strike." },
    ],
  },
  {
    category: "Face",
    trait: "Garou (Citrine)",
    quantity: 108,
    foundation: "Creature Instinct - Reptiles & Insects",
    corePowers:
      "CREATURE INSTINCT: The wearer's physical abilities and senses are modified and enhanced depending on the predator called upon. Initially 1-2 predators, scaling to 10 with leveling. Garou (Citrine) covers REPTILES/INSECTS. Passive powers: Komodo Dragon: Septic Presence (attacks cause opponent's wounds to heal slower); Chameleon: Surface Vanish (visually blends into the environment, must stand still); Anaconda: Vibration Sense (sense opponents through vibrations on surfaces and heat signature); Crocodile: Surface Read (feels opponents through tiny water vibrations and pressure changes); Praying Mantis: Strike Geometry (360 awareness of surroundings); Black Widow: Venom Architecture (progressive contact toxin); Rhino Beetle: Load Bearing (increased strength momentarily, must recover); Hornet: Alarm Pheromone (senses through vibrations and chemical cues); Scorpion: Tremor Detection (fights in total darkness through tremor detection); Turtle: Shell Discipline (shell mode increases defense, but loses mobility).",
    advancedPowers: [
      { name: "Komodo Dragon: Dragon Attack", description: "Super strong, fast, vicious poisoned attack." },
      { name: "Chameleon: Complete Still", description: "Full visual undetectability." },
      { name: "Anaconda: Constrictor Hold", description: "Super strong squeezing, which gets tighter over time." },
      { name: "Crocodile: Death Snap", description: "Burst of increased striking power." },
      { name: "Praying Mantis: Raptorial Strike", description: "Fast powerful strike that arrives before the nervous system registers." },
      { name: "Black Widow: Web Anchor", description: "Brief paralysis of anyone within a small area." },
      { name: "Rhino Beetle: Horn Press", description: "Unstoppable forward drive." },
      { name: "Hornet: Furious Strikes", description: "Series of rapid devastating blows." },
      { name: "Scorpion: Piercing Strike", description: "Piercing venomous attack." },
      { name: "Turtle: Sudden Bite", description: "Sudden limited-range strong attack from stillness." },
    ],
  },
  {
    category: "Face",
    trait: "Garou (Azurite)",
    quantity: 43,
    foundation: "Creature Instinct - Sea Creatures",
    corePowers:
      "CREATURE INSTINCT: The wearer's physical abilities and senses are modified and enhanced depending on the predator called upon. Initially 1-2 predators, scaling to 10 with leveling. Garou (Azurite) covers SEA CREATURES. Passive powers: Orca: Orca Intelligence (processes information faster); Mako Shark: Forward Momentum (faster forward motion); Giant Squid: Deep Pressure Resistance (impact force reduced); Electric Eel: Bio-Charge (passively charge electrical attack, and reduced harm from electrical attacks); Puffer Fish: Threat Display (increased defense, reduced damage from attacks); Piranha: Frenzy Scent (detects and maps existing wounds of opponent); Stingray: Flat Profile (camouflage and increased defense); Japanese Spider Crab: Structural Strength (increased defense and faster health regeneration); Lion Fish: Voracious Appetite (lessened stamina depletion while attacking); Goblin Shark: Disarming Calm (before battle, causes opponent to relax, giving opportunity for surprise strike).",
    advancedPowers: [
      { name: "Orca: Orca Strength", description: "Temporary increased strength and defense." },
      { name: "Mako Shark: Bite Through", description: "Does not stop at the target." },
      { name: "Giant Squid: Tentacle Reach", description: "Multi-point simultaneous field." },
      { name: "Electric Eel: Full Discharge", description: "Releases all stored charge at once." },
      { name: "Puffer Fish: Toxin Bloom", description: "Environmental release in immediate radius." },
      { name: "Piranha: Coordinated Frenzy", description: "Strikes all vulnerabilities simultaneously." },
      { name: "Stingray: Barb Strike", description: "Super strong, fast, vicious poisoned attack." },
      { name: "Japanese Spider Crab: Pincher Attack", description: "Super strong pinpoint attack." },
      { name: "Lion Fish: Spine Deploy", description: "Attacker receives venom in the act of hitting." },
      { name: "Goblin Shark: Jaw Projection", description: "Quick closure of distance - a strike arrives from beyond apparent range." },
    ],
  },
  {
    category: "Face",
    trait: "Foodmasku",
    quantity: 9,
    foundation: "Voracious Strength",
    corePowers:
      "Gluttony: Calorie consumption within a 4 hour timeframe is directly correlated with a speed, strength, and power boost granted to the wearer. During the metabolic process following calorie consumption, these physical boosts gradually rise over the course of the first hour, peak at 1 hour, then gradually decline over 3 hours until the wearer is back at baseline after 4 hours.",
    advancedPowers: [
      {
        name: "Pound for Pound",
        description:
          "Every pound of food the wearer consumes within a 4 hour period is stored and turned into outward explosive TNT bursts that ignite upon impact when the wearer strikes a surface with a fist, palm, elbow, knee, foot, or weapon. 1 pound of food equals 0.25 kilotons of stored TNT. The user can unleash one massive explosion of stored TNT or divide the stored TNT across multiple smaller explosions through multiple strikes. After 4 hours, any unused TNT burst is rendered null, requiring the wearer to consume more food to reload.",
      },
    ],
    drawbacks:
      "The longer you go without using the power - after 4 hours, any unused TNT is damage dealt to yourself. (The record amount of food consumed in a single eating competition was ~22 lbs, roughly 5.5 kilotons of stored TNT in a 4 hour period; a nuclear bomb is between 12-23 kilotons.)",
  },
  {
    category: "Face",
    trait: "Dali Mask",
    quantity: 3,
    foundation: "Surrealist Materialism",
    corePowers:
      "Key Manifestations: 1. Material Fluidity - The wearer can alter the physical properties of objects while maintaining their identity and function. Hard objects might become soft and flexible while still serving their purpose, or normally separate materials might phase through each other while retaining their individual properties. 2. Symbolic Physics - The wearer can impose symbolic relationships onto physical objects, making them behave according to metaphorical connections rather than natural laws. A painting of fire might actually burn, a clock might control local time flow, or a mirror might reflect what's behind rather than in front of it. 3. Contextual Relativity - The wearer manipulates relationships between objects based on context rather than physical proximity. Things that belong together conceptually might affect each other despite distance, while physically adjacent objects might become causally disconnected.",
    advancedPowers: [
      {
        name: "Persistent Symbolism",
        description:
          "The wearer's symbolic alterations to reality become self-sustaining, creating permanent surrealist zones where objects and environments follow dream-logic.",
      },
      {
        name: "Impossible Construction",
        description:
          "The wearer can create physically impossible but functionally stable structures and objects that operate according to their own internal dream-logic.",
      },
      {
        name: "Subjective Objectivity",
        description:
          "At the highest level, the distinction between the subjective and objective collapses within an area. Metaphor becomes literal, associations become causal connections, and personal symbolism shapes material reality.",
      },
    ],
    counters: "Physical disruption immediately reverts all active changes.",
  },
  {
    category: "Face",
    trait: "Barong",
    quantity: 9,
    foundation: "Spirit Guardian",
    corePowers:
      "Summon Protective Spirits: The wearer can call forth spiritual guardians to shield them from harm, either as ethereal shields or as protective entities that block attacks. Spirit Combatants: The spirits can also be called upon to fight alongside the wearer, acting as invisible yet powerful allies in combat.",
    advancedPowers: [
      {
        name: "Divine Shield",
        description:
          "The protective spirits evolve to create a nearly impenetrable barrier that can withstand even the most powerful attacks, protecting the wearer and their allies.",
      },
      {
        name: "Spirit Army",
        description:
          "The wearer can summon an entire army of spirits, overwhelming enemies with sheer numbers and spiritual power.",
      },
    ],
    notes:
      "Holds the only Resurrection Rite: revive ONE ally (not self), once per battle.",
  },
]

// Face traits with no powers (cosmetic / metadata only)
export const faceMetadataTraits = ["Vape", "Nose Scar", "Glasses (Pearl)", "Glasses (Obsidian)", "Bubblegum", "Bandaid", "Void"]
