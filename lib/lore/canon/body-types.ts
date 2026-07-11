import type { CanonTraitPower } from "./types"

// Body types are the primary power-granting trait (Layer 2) - each character's
// core combat identity and foundational power source.
// Transcribed from the Full ETH Trait List master sheet.

export const bodyTypePowers: CanonTraitPower[] = [
  {
    category: "Body",
    trait: "Water",
    quantity: 74,
    foundation: "Hydrokinetic Control",
    corePowers:
      "Tidal Dominion - Water types are the undisputed masters of water in all its forms. Beyond simple hydrokinetics, they can command entire bodies of water, summon storms, and control the seas. Their power is not just limited to water manipulation but extends to dominating any environment that contains water, making them nearly unbeatable in such settings. Water types are the dominant water master. They have massive area influence near water. They are the best healers of all Oni, but the catch is that they cannot heal themselves. They must travel in packs to heal each other. Water is cleansing which justifies them being the dominant healer class.",
    developmentPaths: [
      {
        name: "Hydromancers",
        description:
          "Control water in all its forms for localized area impact, capable of creating floods, ice javelins, ice barriers, or steam clouds.",
      },
      {
        name: "Aquamorphs",
        description:
          "Shape their bodies or environment with water, becoming fluid; they can also use water to heal through water manipulation that transfers medications to the targeted body through water molecules that can be absorbed at the molecular level. Can also control and manipulate the water inside a target's body (to dehydrate a target, to overhydrate a target, or to heal a target).",
      },
      {
        name: "Mass Effect",
        description:
          "Command oceanic forces, summoning tidal waves, hurricanes, and tsunamis, or create a massive fog to disorient a large area.",
      },
    ],
    drawbacks:
      "The best healers of all Oni, but they cannot heal themselves. They must travel in packs to heal each other - creating natural party interdependence.",
  },
  {
    category: "Body",
    trait: "Type-01",
    quantity: 638,
    foundation: "Technological Manipulation",
    corePowers:
      "Nanotech Engineering - Type-01 beings are masters of nanotechnology, capable of creating, repairing, and enhancing technology at a microscopic level. They can manipulate nanites to heal, create objects, or augment their bodies with advanced cybernetics. They CREATE and BUILD technology from raw nanite material without existing infrastructure - Type-01 IS the factory (distinguished from Technogod, which controls existing tech).",
    developmentPaths: [
      {
        name: "Nanoforgers",
        description: "Capable of crafting complex tools, weapons, or structures using nanites.",
      },
      {
        name: "Cyber-Enhancers",
        description: "Upgrade their bodies or others with nanotech, improving physical and mental abilities.",
      },
      {
        name: "Technomancers",
        description: "Control and manipulate technology, integrating with computers and machines effortlessly.",
      },
    ],
  },
  {
    category: "Body",
    trait: "Tiger Skin",
    quantity: 33,
    foundation: "Physical Enhancements and Abilities",
    corePowers:
      "Primal Fury - Tiger Skin types channel primal energy to enhance their physical bodies and attributes to superhuman levels. They can also generate and control fire and heat, using it to further boost their bodies (fire/heat induced adrenaline spikes creating heat trail dashes/bursts), attacks (burning claws, heat wave bursts, flame inducing weapons), or defensive capabilities (condensed heat barriers). Feral DPS/Assassin archetype - mechanically the OPPOSITE of Jasper: lower defense, burst damage, risk/reward mechanics.",
    developmentPaths: [
      {
        name: "Berserkers",
        description: "Tap into a state of heightened power and rage, becoming nearly unstoppable in combat.",
      },
      {
        name: "Pyrokinetics",
        description:
          "Control fire, creating intense flames or using heat to strengthen their physical form. Can also control and manipulate embers and ashes, creating weapons or traps from smoldering remains.",
      },
      {
        name: "Apex Predator Instinct",
        description:
          "Ascend to enhanced physical prowess to control abilities innate to tigers and unleash supernatural speed, strength, agility, and a shrewd sense of smell to track and hone in on targets. Can unleash taut muscles to create blisteringly fast attacks that maximize damage per second, powered by stored internal fire/heat inside muscles that induce adrenaline spikes creating heat trails of dashes and bursts. Attacks can create burning claws, heat wave bursts, or flame induced weapons; can also create defensive capabilities such as condensed heat barriers.",
      },
    ],
    drawbacks:
      "Lower defense - burst damage, risk/reward mechanics. Feral Beast Mode is a timed state with cooldown.",
  },
  {
    category: "Body",
    trait: "Pearlescent",
    quantity: 70,
    foundation: "Celestial Powers",
    corePowers:
      "Light Refraction - Pearlescent types can manipulate cosmic energies, particularly light and gravity. Light can be bent around their bodies to become invisible or create dazzling illusions. They can draw power from the stars, using celestial energy to enhance their abilities, create shields, or launch powerful light-based attacks. They can also manipulate the gravitational field around them to push and pull objects within a given vicinity. Starlight and Moonlight specialist (cool spectrum, ethereal, nocturnal). Gravity is Pearlescent's core domain.",
    developmentPaths: [
      {
        name: "Invisibles",
        description: "Perfect the art of light refraction to become undetectable by sight or sensors.",
      },
      {
        name: "Illusionists",
        description: "Create complex and convincing illusions using light manipulation.",
      },
      {
        name: "Radiance Masters",
        description:
          "Harness and focus light into powerful beams or shields, using them for both offense and defense.",
      },
      {
        name: "Gravity Enforcer",
        description: "Wield gravitational forces to push or pull objects around them.",
      },
    ],
    drawbacks: "Powers severely diminished indoors or underground.",
  },
  {
    category: "Body",
    trait: "Obsidian",
    quantity: 613,
    foundation: "Spatial Manipulation",
    corePowers:
      "Shadowcrafting - Obsidians have the ability to manipulate the fabric of space, particularly in low-light conditions. They can blend into shadows, become intangible, or create solid constructs from shadow material. Their control over space allows them to bend reality within these shadows, making them formidable opponents in darkness.",
    developmentPaths: [
      {
        name: "Voidwalkers",
        description:
          "Ability to phase through shadows, becoming invisible and intangible in darkness. Can also freeze shadow space in an area, preventing enemy teleportation and phasing within it; this gives the user a unique anti-mobility counter role.",
      },
      {
        name: "Shadowforgers",
        description: "Create weapons and armor from solidified shadows, enhancing their combat prowess.",
      },
      {
        name: "Nightbringer",
        description: "Amplify their senses and strength in the dark, becoming faster and more agile.",
      },
    ],
    drawbacks: "Loses ALL shadow powers in direct sunlight.",
    counters: "Countered by the Ra Mask's Eternal Daylight.",
  },
  {
    category: "Body",
    trait: "Kabuki",
    quantity: 57,
    foundation: "Spiritual Manipulation",
    corePowers:
      "Mind Sculpting - Kabuki types have the power to influence the spiritual and mental realms. They can manipulate minds, create and project illusions, and delve into the dream world. They have the capacity to turn dreams into reality by temporarily giving physical form to items from the dream world. Their abilities also allow them to see beyond the physical, predicting events and shaping reality through spiritual means. Kabuki illusions are psychic/mind-based (only the target perceives them).",
    developmentPaths: [
      {
        name: "Dreamweavers",
        description:
          "Create intricate psychic/mind based dreamscapes that can influence reality, affecting both the physical and spiritual worlds.",
      },
      {
        name: "Mindbenders",
        description:
          "Control and manipulate the thoughts and emotions of others, inducing fear, love, or confusion.",
      },
      {
        name: "Maestros",
        description:
          "Conduct perfect psychic/mind based illusions that temporarily appear, feel, sound, and smell real.",
      },
      {
        name: "Oracles",
        description:
          "Use their spiritual connection to read emotional/psychological intent in others to predict future events. (Oracle power is limited to reading intent/emotional state - not true future sight.)",
      },
    ],
    drawbacks: "Overusage causes multiple personality disorder.",
  },
  {
    category: "Body",
    trait: "Jasper",
    quantity: 1875,
    foundation: "Physical Enhancements and Abilities",
    corePowers:
      "Earth Resonance - Jaspers are deeply connected to the physical world and can enhance their bodies to become stronger and more durable. They can tap into the Earth's properties to increase their physical power or merge with the terrain to become nearly invulnerable. Defensive Earth Tank archetype: Iron Skin (passive damage reduction stacking up to 5 times), Seismic Stomp (AOE crowd control), Earthen Fortress (terrain reshaping). Jasper IS the earth - mechanically opposite of Tiger Skin.",
    developmentPaths: [
      {
        name: "Juggernauts",
        description:
          "Extreme physical resilience, capable of withstanding immense damage and continuing to fight.",
      },
      {
        name: "Gigantify",
        description: "Ability to temporarily triple in size and strength to become a towering force. (Signature Ultimate.)",
      },
      {
        name: "Gaia's Might",
        description:
          "Draw strength from different Earth elements to harden select body parts for enhanced attack and defense.",
      },
    ],
    drawbacks: "Cannot dash or sprint - speed is their weakness.",
  },
  {
    category: "Body",
    trait: "Citrine",
    quantity: 1989,
    foundation: "Elemental Control",
    corePowers:
      "Elemental Harmony - Citrines have mastery over the five fundamental elements of nature: Earth, Fire, Water, Air, and Space (Ether). They can command and manipulate these elements to reshape their environment, control the weather, and create barriers or offensive attacks. The rule that governs all of these: Citrine controls the element EXTERNALLY. Specialists integrate it into their body or identity. " +
      "Earth - Terrain shaping: raise stone barriers, hurl boulders, crack the ground, create tremors. Cannot merge with terrain, harden their own body, or gigantify (Jasper's exclusive domain - Jasper IS the earth, Citrine just moves it). " +
      "Fire - Environmental flame projection: throw fire, create heat walls, sustain burning fields. Cannot integrate fire into their own body, generate heat-adrenaline speed bursts, or use burning claws (Tiger Skin owns fire as biological enhancement; Citrine owns fire as an external force). " +
      "Water - Localized water manipulation: redirect water sources, form ice constructs, create pressurized water jets. Cannot command entire bodies of water, summon tidal forces, or heal through water (Water body type owns water at scale and as medicine). " +
      "Air - Citrine's strongest individual element because no body type fully owns air: wind gusts, pressure waves, air barriers, partial flight assist. " +
      "Space/Ether - The most abstract element and the one that makes Citrine genuinely unpredictable: localized pressure anomalies, vacuum pockets that implode inward, short-range spatial displacement (a blink-step, not a teleport), and gravitational micro-distortions that slow movement in a small area. Weaker than Pearlescent's gravity manipulation which operates at celestial scale - Citrine's space is intimate and surgical where Pearlescent's is cosmic.",
    developmentPaths: [
      {
        name: "Earth + Fire: Magma Surge",
        description:
          "Slow-moving but highly destructive terrain threat: lava fists, lava release, massive area damage, hardened lava bullets, hardened lava shield.",
      },
      {
        name: "Air + Water: Localized Storm Cell",
        description:
          "Short-range storm under their control: hail storms, lightning strikes from storm clouds, and weaponized tornado formations.",
      },
      {
        name: "Fire + Air: Superheated Vortex",
        description: "Burning cyclone with medium range.",
      },
      {
        name: "Earth + Air: Dust Veil",
        description:
          "Vision obscuring sandstorm with physical density: quicksand traps, earthen barriers, dust storms.",
      },
      {
        name: "Water + Fire: Steam Explosion",
        description: "Concussive burst, brief area denial.",
      },
      {
        name: "Earth + Water: The Drowned Ground",
        description:
          "Water animates earth rather than eroding it. Bog generation turns dry ground into localized quicksand. Clay surge raises wet earth into temporary constructs or walls. Silt flood rolls dense mud that buries rather than flows. Pressure suction softens ground beneath a target and pulls downward, rooting movement. The most patient combo - it waits for enemies to walk into it.",
      },
      {
        name: "Earth + Space: Null Terrain",
        description:
          "Spatial displacement removes earth from physical law - gravity becomes a choice. Levitation field strips boulders of weight and orbits them at a point the Citrine defines. Directed impact releases suspended stone at any angle with full accumulated momentum. Gravity sink pins a localized anomaly to a terrain feature pulling everything nearby inward. Impossible architecture holds stone in configurations that cannot exist under normal physics.",
      },
      {
        name: "Fire + Space: Phantom Fire",
        description:
          "Combustion displaced from its source - fire appears where there is no reason for it. Spatial seeding deposits fire silently behind a target with no visible origin. Thermal theft pulls heat from one location and deposits it in another, extinguishing one fire by relocating it. Delayed ignition places fire in a location but holds it unlit until the Citrine releases it. The most psychologically unsettling combo - opponents cannot identify where the next ignition will come from.",
      },
      {
        name: "Water + Space: Abyssal Pressure",
        description:
          "The pressure of the deepest ocean, localized and weaponized without needing depth. Pressure shell compresses water around a target to deep-sea levels. Implosion pocket creates a vacuum that collapses inward - water rushing to fill it produces a directed concussive pull. Hydrostatic freeze solidifies water under extreme spatial pressure at room temperature - denser than ice. Crushing field sustains a pressure anomaly across an area where movement becomes nearly impossible. The most physically dangerous combo in terms of raw bodily harm.",
      },
      {
        name: "Air + Space: The Breathless",
        description:
          "Atmospheric pressure meets spatial displacement - the air is not moved, it is removed. Vacuum pocket pulls air from a location entirely: no breath, no sound, no fire. Explosive decompression releases the sealed vacuum suddenly, returning air with enough force to throw targets. Pressure differential strike sends air through a spatial shortcut so it arrives at impossible velocity - wind that hits like a wall. Suffocation field sustains the vacuum. The Citrine doesn't need to fight anyone inside it. They just wait.",
      },
    ],
    notes:
      "Yokai specialize in ONE elemental combo (they can still use each element individually, but combine only their two elements into one convergence power - one development path). Bakemono specialize in TWO elemental combination development paths (4 individual elements into two fixed pairs - e.g. air+water and earth+fire - but cannot switch combinations).",
  },
  {
    category: "Body",
    trait: "Azurite",
    quantity: 1835,
    foundation: "Emotion Manipulation",
    corePowers:
      "External Empathic Abilities - Azurites have the ability to manipulate emotions, whether their own or others', to alter the targeted body for offensive or defensive purposes. With a range of emotions - Happiness, Sadness, Anger, Fear, Surprise, and Disgust - under their control, they have the potential to be well-balanced or over-balanced in any given empathic power.",
    developmentPaths: [
      {
        name: "Strength of Joy",
        description:
          "The user becomes physically stronger, faster, more durable, and gains enhanced senses based on their level of happiness or the happiness around them; the happier they are, the more powerful their physical capabilities become.",
      },
      {
        name: "Protection of Sorrow",
        description: "Retreating into oneself to create a wall or shell for defense.",
      },
      {
        name: "Sparks of Anger",
        description: "Emits electrically charged bolts of energy; lightning.",
      },
      {
        name: "Vibrations of Fear",
        description: "Vibration blades and shields.",
      },
      {
        name: "Bursts of Surprise",
        description:
          "Emit an EMP (electromagnetic pulse) that can disrupt, damage, or destroy electronic devices and critical infrastructure.",
      },
      {
        name: "Aura of Disgust",
        description: "Creates a nauseating effect and weakens those who are nearby.",
      },
    ],
    notes:
      "Yokai get to use and specialize in TWO of the emotions; Bakemono get to use and specialize in FOUR of the emotions. No Azurite can tap into all six.",
  },
  {
    category: "Body",
    trait: "Ash",
    quantity: 586,
    foundation: "Temporal & Evolutionary Manipulation",
    corePowers:
      "Temporal Echoes - Ash types can manipulate the flow of time and evolution, allowing them to influence time in localized areas. They can slow down or speed up time, heal by reverting injuries, or even manipulate the aging process. They can also tap into the evolutionary potential of themselves or others, accelerating growth or mutations. The ability to perceive literal future events is the EXCLUSIVE domain of the Ash body type. Highest power ceiling in the collection.",
    developmentPaths: [
      {
        name: "Chronomancers",
        description:
          "Control the moment - the flow of time - to slow down or accelerate movements of oneself or others, create short time loops, rewind time for a \"do over\" when things are looking bleak, or rapidly accelerate time to perceive literal future events and gain invaluable information (then rewind time back to present day if the user has sufficient remaining power and lifespan). Can revert injuries or conditions by rewinding the affected area's timeline; applies to oneself or others.",
      },
      {
        name: "Aging Masters",
        description:
          "Can control matter, such as accelerating the aging process in enemies or objects, causing them to degrade rapidly.",
      },
      {
        name: "Evolutionists",
        description:
          "Control biology - pull forward one's evolutionary potential to accelerate physical power growth or One Source power growth. This power comes with 2x aging to self, and any damage received is doubled.",
      },
    ],
    drawbacks:
      "Each usage of time manipulation permanently accelerates the Ash character's own aging. Tragic arc: random mutations occur from overuse.",
  },
]
