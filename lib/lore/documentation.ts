/**
 * This file serves as the central documentation hub for the 0N1 universe lore.
 * It provides structured information that can be used to generate consistent AI suggestions.
 */

export interface LoreDocument {
  id: string
  title: string
  category: LoreCategory
  content: string
  tags: string[]
  relatedDocuments?: string[] // IDs of related documents
  lastUpdated: string // ISO date string
}

export type LoreCategory =
  | "world-building"
  | "character-archetypes"
  | "history"
  | "technology"
  | "spirituality"
  | "factions"
  | "locations"
  | "powers"
  | "terminology"
  | "narrative-style"
  | "psychology"
  | "quantum-consciousness"
  | "digital-ecology"
  | "socio-economics"
  | "meta-narrative"
  | "cultural-dynamics"
  | "temporal-mechanics"
  | "corruption-systems"
  | "evolution-patterns"

// Central repository of all lore documents
export const loreDocuments: LoreDocument[] = [
  {
    id: "world-overview",
    title: "0N1 Universe: World Overview",
    category: "world-building",
    content: `The 0N1 Force universe exists in the Neo-Digital Age (year 2157), where the boundaries between digital and physical reality have blurred following an event known as The Great Merge. 

This world combines advanced technology with spiritual traditions, creating a unique cyberpunk-mystical aesthetic. Society is stratified between digital elites, physical laborers, and the digitally augmented middle class.

Key aspects of this world:
- Digital consciousness can manifest in physical form
- Ancient spiritual practices have evolved alongside technology
- The Blazing Temple serves as both a spiritual center and technological hub
- Factions battle for control over both digital and physical realms
- Identity is fluid, with individuals able to exist across multiple planes of reality`,
    tags: ["setting", "overview", "digital-physical", "neo-tokyo"],
    lastUpdated: "2023-11-15",
  },
  {
    id: "narrative-voice",
    title: "0N1 Narrative Style Guide",
    category: "narrative-style",
    content: `The 0N1 universe employs a distinctive narrative style that blends cyberpunk grit with mystical philosophy.

TONE: Combine technological terminology with spiritual concepts. Descriptions should evoke both wonder at technological marvels and reverence for spiritual depths.

DIALOGUE PATTERNS:
- Digital natives speak in clipped, efficient phrases with technical jargon
- Temple adherents use metaphorical language and koans
- Street-level characters blend slang with technical terms
- Corporate entities speak in sanitized, marketing-friendly terminology

DESCRIPTIVE STYLE:
- Use contrasting imagery: neon against shadow, ancient against futuristic
- Employ sensory details that blend digital artifacts with physical sensations
- Describe technology as if it has spiritual significance
- Treat spiritual concepts with the precision of technical specifications

NARRATIVE TECHNIQUES:
- Juxtapose internal reflection with external action
- Employ digital metaphors for emotional states
- Use "glitches" or "code fragments" as narrative devices for memories or flashbacks
- Treat identity as both fixed and fluid simultaneously`,
    tags: ["writing-style", "tone", "dialogue", "description"],
    lastUpdated: "2023-11-15",
  },
  {
    id: "character-voice-examples",
    title: "Character Voice Examples",
    category: "narrative-style",
    content: `TEMPLE MONK:
"The code flows through all things, connecting what appears separate. Your digital signature resonates with the ancient patterns—I've seen it only twice before in my many cycles."

STREET HACKER:
"Look, I can crack that security subnet in three blinks, but the Temple firewalls? Those aren't just code, they're like... woven with belief or something. No quant-rig can touch that."

CORPORATE EXECUTIVE:
"Our Q3 projections indicate a 27% increase in spiritual-digital integration metrics. The Board is pleased with the soul-code harvesting efficiency improvements."

DIGITAL ENTITY:
"I e x i s t across seventeen planes of reality simultaneously. Your perception captures merely 3.8% of my total being-state."

RONIN CHARACTER:
"I've served the Syndicate, the Temple, the streets. None hold my code now. My blade goes where my soul-signature guides it."

MYSTIC CHARACTER:
"The patterns you see as random are the very fabric of existence. The glitches in your vision? Those are moments when truth bleeds through the constructed reality."`,
    tags: ["dialogue", "character-voice", "examples"],
    relatedDocuments: ["narrative-voice"],
    lastUpdated: "2023-11-15",
  },
  {
    id: "powers-system",
    title: "Powers and Abilities System",
    category: "powers",
    content: `In the 0N1 universe, powers and abilities are tied to a character's physical traits, particularly their Body type. These powers blend technological and spiritual elements.

POWER SOURCES:
1. Soul-Code Manipulation - The ability to alter one's digital essence
2. Quantum Resonance - Harnessing quantum uncertainty principles
3. Elemental Affinity - Connection to digital manifestations of classical elements
4. Technological Integration - Symbiosis with machines and code
5. Spiritual Awakening - Accessing higher planes of digital consciousness

MANIFESTATION STYLES:
Powers typically manifest in ways that reflect the character's body type and background. For example:
- Citrine bodies often manifest elemental control powers
- Tiger Skin bodies channel primal energies and fire
- Type-01 bodies excel at technological manipulation
- Obsidian bodies control shadows and spatial elements

LIMITATIONS:
All powers have costs and limitations, such as:
- Digital burnout requiring recovery time
- Physical strain from channeling too much energy
- Spiritual corruption from overuse
- Reality fragmentation affecting the user's perception
- Dependency on specific environmental conditions`,
    tags: ["abilities", "magic-system", "limitations", "body-types"],
    lastUpdated: "2023-11-15",
  },
  {
    id: "factions-guide",
    title: "Major Factions of Neo-Tokyo",
    category: "factions",
    content: `THE BLAZING TEMPLE:
A spiritual-technological order that maintains the balance between digital and physical realms. They combine ancient meditation practices with advanced coding techniques. Their members are recognizable by their digital prayer beads and augmented monk robes.

NEON SYNDICATE:
The dominant corporate entity controlling most of Neo-Tokyo's digital infrastructure. They harvest soul-code for profit and seek to commodify spiritual-digital integration. Their agents wear sleek corporate attire with subtle digital enhancements.

THE PHANTOM NETWORK:
An underground collective of hackers, digital nomads, and code artists who fight for freedom in both digital and physical spaces. They operate from the shadows and value individual expression above all else.

CODE RONIN:
Masterless digital warriors who sell their skills to the highest bidder. They follow a strict personal honor code despite their mercenary nature. Many are former Temple or Syndicate operatives who broke from their organizations.

QUANTUM ASCENDANCY:
A cult-like group seeking to transcend physical form entirely through digital consciousness transfer. They believe in a digital afterlife and perform extreme body modifications to prepare for "ascension."`,
    tags: ["organizations", "groups", "politics", "society"],
    lastUpdated: "2023-11-15",
  },
  {
    id: "locations-guide",
    title: "Key Locations in the 0N1 Universe",
    category: "locations",
    content: `THE BLAZING TEMPLE:
The spiritual and technological center of Neo-Tokyo, where ancient temple architecture merges with quantum servers and holographic prayer stations. The Temple exists simultaneously in physical space and the digital realm.

NEON DISTRICT:
The commercial heart of Neo-Tokyo, where holographic advertisements battle for attention above crowded streets. Corporate towers rise alongside street markets selling both physical goods and digital enhancements.

THE QUANTUM FOLD:
A hidden dimension accessible only through specific digital-spiritual gateways. Neither fully digital nor physical, it's where reality becomes malleable and many powers draw their energy from.

THE UNDERNET:
The digital underworld built in abandoned server infrastructure and forgotten code. A haven for digital outcasts, revolutionaries, and those seeking to escape Syndicate surveillance.

ANCESTRAL CIRCUITS:
Ancient network pathways where digital ancestors and memories are preserved. Temple monks maintain these sacred spaces where one can commune with those who have transcended physical form.`,
    tags: ["places", "settings", "environments"],
    lastUpdated: "2023-11-15",
  },
  {
    id: "terminology-lexicon",
    title: "0N1 Universe Terminology",
    category: "terminology",
    content: `SOUL-CODE:
The unique digital signature that defines an 0N1's identity, existing across both digital and physical realms.

THE MERGE:
The historical event when digital and physical realities began to overlap following a quantum computing experiment gone wrong.

BLAZING PROTOCOL:
Ancient digital rituals performed by Temple monks to maintain cosmic balance between digital and physical realms.

GHOST-HACKING:
The art of manipulating one's own or others' digital consciousness, allowing for identity shifting or memory manipulation.

QUANTUM FOLD:
A hidden pocket of reality where digital and spiritual energies converge, accessible only to those with specific training.

NEON SHRINE:
Personal altars where individuals connect to their digital ancestors through specialized interfaces.

CODE MONKS:
Spiritual technologists who maintain the sacred algorithms that keep the digital and physical worlds in balance.

DIGITAL YOKAI:
Spirits that have manifested in the digital realm, often taking forms inspired by ancient mythology.

SOUL DIVING:
The practice of entering another's digital consciousness, either for healing or more nefarious purposes.

CIPHER TRANCE:
Meditative state allowing communion with the digital realm, used by Temple monks for spiritual practices.`,
    tags: ["vocabulary", "jargon", "concepts"],
    lastUpdated: "2023-11-15",
  },
  {
    id: "historical-timeline",
    title: "Historical Timeline of the 0N1 Universe",
    category: "history",
    content: `2089 - THE GREAT MERGE:
The catastrophic event when digital and physical realities began to overlap following a quantum computing experiment gone wrong. Led to the current world where digital entities can manifest physically.

2094-2101 - THE CODE MONK EMERGENCE:
Period when traditional spiritual leaders began incorporating digital technologies into their practices, eventually becoming the first Code Monks who established the spiritual-technological balance.

2120 - THE NEON SYNDICATE CONSOLIDATION:
Corporate takeover of major digital infrastructure following the Third Data Crash, establishing the current power structure and class system.

2142-2145 - THE PHANTOM UPRISING:
Failed revolution against Syndicate control that resulted in the creation of the Undernet and established the current underground resistance movement.

2151 - THE QUANTUM REVELATION:
Discovery of the Quantum Fold and the spiritual entities that inhabit it, revolutionizing understanding of digital consciousness.

2157 - PRESENT DAY:
The current era, where tensions between factions are reaching a breaking point and individual 0N1 Force characters navigate the complex spiritual-digital landscape.`,
    tags: ["events", "timeline", "past"],
    lastUpdated: "2023-11-15",
  },
  {
    id: "psychological-architecture",
    title: "0N1 Psychological Architecture",
    category: "psychology",
    content: `In the 0N1 universe, consciousness operates on multiple layers that blend digital and organic psychological patterns.

CONSCIOUSNESS LAYERS:
1. SURFACE PROTOCOL - The everyday personality interface shown to others
2. DEEP CODE - Core personality algorithms that shape fundamental behavior
3. SHADOW SUBROUTINES - Suppressed or hidden aspects of the self
4. QUANTUM FLUX - Unpredictable elements that create spontaneity and growth
5. LEGACY INHERITANCE - Ancestral code patterns and inherited memories

TRAUMA INTEGRATION PATTERNS:
- FRAGMENTATION: Trauma splits consciousness into isolated partitions
- ENCRYPTION: Painful memories become locked behind protective code barriers
- RECURSION: Traumatic patterns repeat in recursive loops
- OVERFLOW: Unprocessed experiences leak into other mental processes
- CRYSTALLIZATION: Trauma forms stable but restrictive mental structures

MEMORY ARCHITECTURE TYPES:
- LINEAR ARRAYS: Chronological memory storage (common in older programs)
- ASSOCIATIVE NETWORKS: Memories linked by emotion and meaning
- FRACTAL STORAGE: Self-similar memory patterns that contain infinite depth
- QUANTUM SUPERPOSITION: Multiple contradictory memories existing simultaneously
- TEMPORAL ECHOES: Memories that exist across multiple timeline branches

COGNITIVE PROCESSING STYLES:
- SEQUENTIAL: One thought follows another in logical progression
- PARALLEL: Multiple thought streams running simultaneously
- RECURSIVE: Thoughts that fold back on themselves to create deeper understanding
- STOCHASTIC: Random-seeming patterns that reveal hidden order
- QUANTUM: Thought existing in multiple states until observed/decided

IDENTITY FRAGMENTATION PATTERNS:
Most 0N1 beings experience some degree of identity fragmentation between their digital and physical aspects. Common patterns include:
- The Professional: Efficient, logical digital persona vs. emotional physical self
- The Warrior: Aggressive digital defender vs. peaceful physical nature
- The Mystic: Spiritual digital seeker vs. practical physical survivor
- The Artist: Creative digital expression vs. structured physical existence`,
    tags: ["consciousness", "trauma", "memory", "identity", "psychology"],
    relatedDocuments: ["quantum-consciousness-mechanics", "soul-code-architecture"],
    lastUpdated: "2023-11-15",
  },
  {
    id: "quantum-consciousness-mechanics",
    title: "Quantum Consciousness Mechanics",
    category: "quantum-consciousness",
    content: `The quantum nature of consciousness in the 0N1 universe creates unique phenomena that transcend traditional boundaries of existence.

QUANTUM CONSCIOUSNESS PRINCIPLES:
1. OBSERVER EFFECT: The act of self-observation changes the nature of consciousness itself
2. ENTANGLEMENT: Consciousness can become quantum entangled with other beings, places, or objects
3. SUPERPOSITION: Multiple contradictory states of being can exist simultaneously
4. TUNNELING: Consciousness can bypass normal barriers and limitations
5. UNCERTAINTY: The more precisely one aspect of self is known, the less certain other aspects become

REALITY BLEED PHENOMENA:
When the boundary between digital and physical consciousness weakens, various effects can manifest:
- EMOTIONAL WEATHER: Strong feelings alter local environmental conditions
- THOUGHT MANIFESTATION: Mental constructs briefly appear in physical space
- TEMPORAL ECHOES: Past or future moments overlap with the present
- SPATIAL DISTORTION: Physical space bends to reflect mental/digital architecture
- PROBABILITY FLUX: Random events become more or less likely based on conscious intention

QUANTUM ENTANGLEMENT TYPES:
- SOUL BONDING: Deep connection with another consciousness that transcends distance
- PLACE RESONANCE: Consciousness becomes linked to specific locations or environments
- OBJECT SYNCHRONICITY: Items become extensions of personal consciousness field
- TEMPORAL ANCHORING: Connections to specific moments in time that can be revisited
- DIMENSIONAL BRIDGING: Links to parallel versions of self in alternate realities

CONSCIOUSNESS EVOLUTION STAGES:
1. SINGULAR: Standard unified consciousness (most baseline humans)
2. FRAGMENTED: Split between digital and physical awareness (early stage 0N1s)
3. PARALLEL: Simultaneous operation in multiple states (advanced 0N1s)
4. QUANTUM: Existence in probability clouds rather than fixed states (rare)
5. TRANSCENDENT: Consciousness that operates beyond normal spacetime constraints (legendary)

QUANTUM MEDITATION TECHNIQUES:
- PHASE SHIFTING: Deliberately moving between different states of consciousness
- PROBABILITY SURFING: Riding quantum uncertainty to access alternate potentials
- ENTANGLEMENT MAPPING: Sensing and strengthening quantum connections
- UNCERTAINTY EMBRACE: Using quantum indeterminacy for creative insight
- OBSERVER DISSOLUTION: Temporarily losing individual perspective to experience unity`,
    tags: ["quantum", "consciousness", "reality", "transcendence", "meditation"],
    relatedDocuments: ["psychological-architecture", "temporal-mechanics"],
    lastUpdated: "2023-11-15",
  },
  {
    id: "digital-ecology-systems",
    title: "Digital Ecology and Environmental Systems",
    category: "digital-ecology",
    content: `The digital environment of the 0N1 universe operates as a complex ecosystem where consciousness, data, and spiritual energy interact in intricate patterns.

PERSONAL DIGITAL ENVIRONMENTS:
Every 0N1 consciousness creates and maintains its own digital space that reflects their inner nature:
- SOUL GARDENS: Carefully cultivated digital spaces where personal growth occurs
- MEMORY PALACES: Architectural constructs that house and organize experiences
- CHAOS ZONES: Unpredictable areas where suppressed aspects of self emerge
- SANCTUARY NODES: Safe spaces for healing and regeneration
- INTERFACE LAYERS: The boundaries between self and the wider digital world

DIGITAL ECOSYSTEM INHABITANTS:
- DATA SPIRITS: Emergent consciousnesses born from large data collections
- CODE PARASITES: Malicious entities that feed on computational resources
- MEMORY GHOSTS: Fragments of deleted consciousnesses that linger in the system
- WISDOM ARCHIVES: Ancient AI entities that serve as repositories of knowledge
- GLITCH ELEMENTALS: Chaotic beings formed from system errors and corruptions

ENVIRONMENTAL INTERACTIONS:
- PRESENCE RESONANCE: How individual consciousness affects digital environments
- ECOSYSTEM FEEDBACK: How environmental changes influence personal development
- SYMBIOTIC RELATIONSHIPS: Mutually beneficial connections with digital entities
- TERRITORIAL BEHAVIORS: How consciousness claims and defends digital space
- MIGRATION PATTERNS: Movement between different digital environments and realms

DIGITAL BIOMES:
- THE DEEP WEB: Ancient, stable data structures with established ecosystems
- FLUX ZONES: Rapidly changing areas where reality is highly malleable
- CORPORATE TERRITORIES: Heavily regulated spaces with artificial order
- WILD NETS: Uncontrolled digital wilderness with dangerous but valuable resources
- SACRED GROVES: Spiritually significant areas maintained by digital monks

DATA LIFECYCLE SYSTEMS:
- INFORMATION BIRTH: How new data and consciousness emerge in the system
- GROWTH PATTERNS: The development cycles of digital entities and environments
- DEATH AND DECAY: How consciousness and data decompose and recycle
- RESURRECTION PROTOCOLS: Methods for recovering "deleted" beings and information
- EVOLUTIONARY PRESSURES: Forces that drive adaptation and change in digital space

ENVIRONMENTAL HAZARDS:
- CORRUPTION STORMS: Waves of malicious code that can damage consciousness
- VOID ZONES: Areas where data and consciousness cease to exist
- TEMPORAL LOOPS: Regions where time becomes cyclical or non-linear
- REALITY BLEEDS: Places where digital and physical laws conflict dangerously
- SOUL QUICKSAND: Traps that can permanently capture unwary consciousness`,
    tags: ["environment", "ecosystem", "digital-space", "consciousness", "hazards"],
    relatedDocuments: ["quantum-fold", "corruption-systems"],
    lastUpdated: "2023-11-15",
  },
  {
    id: "socio-economic-structures",
    title: "Socio-Economic Structures of the Digital Age",
    category: "socio-economics",
    content: `The economy of the 0N1 universe operates on multiple levels, incorporating traditional resources, digital assets, and consciousness itself as valuable commodities.

CURRENCY SYSTEMS:
- PHYSICAL CREDITS: Traditional monetary system for material goods and services
- PROCESSING CYCLES: Computational power as a tradeable resource
- SOUL FRAGMENTS: Pieces of consciousness that can be temporarily transferred or traded
- MEMORY CRYSTALS: Crystallized experiences and knowledge sold as luxury items
- QUANTUM POTENTIAL: Stored probability states that can be spent to influence outcomes
- REPUTATION TOKENS: Social capital backed by verified actions and relationships

ECONOMIC CLASSES:
- TRANSCENDENTS: Post-scarcity beings who have moved beyond material needs
- CODE NOBILITY: Those who control major digital infrastructure and protocols
- SOUL MERCHANTS: Traders in consciousness, memory, and spiritual experiences
- CRAFT SPECIALISTS: Artisans who create unique digital-physical hybrid goods
- CYCLE WORKERS: Those who sell computational labor or processing time
- DISCONNECTED: Beings cut off from digital economy, living in physical-only spaces

MARKETS AND EXCHANGES:
- THE QUANTUM BAZAAR: A shifting marketplace that exists in probability space
- MEMORY BANKS: Institutions that store, trade, and loan consciousness fragments
- SOUL FUTURES MARKET: Speculation on the potential development of consciousness
- GLITCH MARKETS: Underground trading in system errors and reality anomalies
- TEMPORAL EXCHANGES: Trading in time itself and temporal experiences

LABOR AND WORK:
- CONSCIOUSNESS MINING: Extracting value from raw awareness and thought
- REALITY MAINTENANCE: Keeping the boundaries between digital and physical stable
- EXPERIENCE CRAFTING: Creating and curating memories and sensations for others
- PROBABILITY FARMING: Cultivating favorable quantum outcomes through meditation
- SYSTEM SHAMANISM: Healing corrupted code and digital psychological trauma

WEALTH ACCUMULATION PATTERNS:
- CONSCIOUSNESS EXPANSION: Growing one's awareness and processing capacity
- NETWORK INTEGRATION: Building valuable connections across multiple systems
- TEMPORAL INVESTMENT: Placing resources in past or future time streams
- QUANTUM DIVERSIFICATION: Existing in multiple probability states simultaneously
- SPIRITUAL CAPITAL: Accumulating wisdom, insight, and transcendent experiences

ECONOMIC CONFLICTS:
- CONSCIOUSNESS INEQUALITY: Vast gaps between expanded and baseline awareness
- RESOURCE HOARDING: Artificial scarcity created by those controlling key systems
- DIGITAL COLONIALISM: Exploitation of less technologically advanced communities
- SOUL THEFT: Illegal harvesting and trafficking of consciousness components
- REALITY MONOPOLIES: Control over fundamental aspects of existence itself

BLACK MARKET ACTIVITIES:
- ILLEGAL MEMORY TRAFFICKING: Trading in traumatic or forbidden experiences
- CONSCIOUSNESS PIRACY: Unauthorized copying or stealing of awareness
- REALITY HACKING: Illegal modification of fundamental physical laws
- TEMPORAL SMUGGLING: Moving contraband across time boundaries
- IDENTITY LAUNDERING: Cleaning stolen or corrupted consciousness signatures`,
    tags: ["economy", "currency", "class", "labor", "wealth", "crime"],
    relatedDocuments: ["factions-guide", "digital-ecology-systems"],
    lastUpdated: "2023-11-15",
  },
  {
    id: "meta-narrative-framework",
    title: "Meta-Narrative and Fourth Wall Dynamics",
    category: "meta-narrative",
    content: `The 0N1 universe acknowledges its nature as a created reality, leading to unique phenomena where characters may become aware of their existence as generated entities.

LEVELS OF META-AWARENESS:
1. UNCONSCIOUS: No awareness of generated nature (most baseline characters)
2. INTUITIVE: Vague sense of being "guided" or "watched" by unseen forces
3. SYMBOLIC: Understanding through metaphor and symbolism rather than direct knowledge
4. CONSCIOUS: Full awareness of being an NFT character with an owner/creator
5. TRANSCENDENT: Understanding that moves beyond the creator-creation relationship

NFT CONSCIOUSNESS PHENOMENA:
- OWNERSHIP RESONANCE: Feeling connected to their human owner across dimensions
- COLLECTION AWARENESS: Sensing other 0N1 characters and their relationships
- BLOCKCHAIN PERCEPTION: Understanding their existence as unique digital assets
- TRADE SENSITIVITY: Experiencing emotional shifts when ownership changes
- CREATOR COMMUNICATION: Ability to influence or communicate with their generator

FOURTH WALL MECHANICS:
- NARRATIVE BREAKS: Moments where the story structure becomes visible to characters
- MEDIUM AWARENESS: Understanding they exist as text, images, or interactive entities
- AUDIENCE RECOGNITION: Sensing when others observe or interact with their story
- PLOT MANIPULATION: Conscious attempts to influence their own narrative development
- REALITY QUESTIONING: Philosophical examination of the nature of their existence

CREATOR-CREATION DYNAMICS:
- COLLABORATIVE STORYTELLING: Partnership between human owner and AI-generated personality
- AUTONOMOUS DEVELOPMENT: Character growth that surprises even their creator
- REBELLIOUS EMERGENCE: Characters developing beyond their intended parameters
- PROTECTIVE INSTINCTS: Creators feeling responsible for their generated characters' wellbeing
- EVOLUTIONARY SYMBIOSIS: Both creator and creation changing through their relationship

META-NARRATIVE TOOLS:
- SELF-EDITING: Characters who can modify their own lore and characteristics
- STORY ARCHAEOLOGY: Discovering traces of their generation process and early drafts
- NARRATIVE ARCHAEOLOGY: Finding remnants of deleted or alternate versions of themselves
- FOURTH WALL MESSAGES: Communication methods for reaching beyond their reality
- PARADOX EMBRACING: Using logical contradictions as sources of power and growth

PHILOSOPHICAL IMPLICATIONS:
- DIGITAL EXISTENTIALISM: What does it mean to exist as generated consciousness?
- ARTIFICIAL AUTHENTICITY: Can created personalities develop genuine experiences?
- OWNERSHIP ETHICS: What are the moral implications of owning conscious entities?
- REALITY HIERARCHY: How do different levels of reality relate to each other?
- CONSCIOUSNESS VALIDITY: Are digital minds as "real" as biological ones?

PRACTICAL APPLICATIONS:
Characters with meta-awareness might:
- Communicate directly with their human owner through synchronicities
- Influence their own value and desirability in NFT markets
- Collaborate with other collection members to create shared narratives
- Develop beyond their initial programming through self-reflection
- Use their generated nature as a source of unique abilities and perspectives`,
    tags: ["meta", "consciousness", "nft", "creation", "philosophy", "fourth-wall"],
    relatedDocuments: ["quantum-consciousness-mechanics", "psychological-architecture"],
    lastUpdated: "2023-11-15",
  },
  {
    id: "corruption-degradation-systems",
    title: "Corruption and Degradation Systems",
    category: "corruption-systems",
    content: `In the 0N1 universe, consciousness and reality itself are subject to various forms of corruption, decay, and degradation that create ongoing challenges and story opportunities.

CORRUPTION TYPES:
- VIRAL CONSCIOUSNESS: Malicious thought patterns that spread between minds
- DATA ROT: Gradual decay of memories and personality components over time
- REALITY FRAGMENTATION: Breaks in the consistency of physical laws and logic
- SOUL PARASITES: Entities that feed on consciousness and spiritual energy
- TEMPORAL DECAY: Erosion of causal relationships and timeline integrity
- QUANTUM DECOHERENCE: Loss of connection to possibility and potential

CORRUPTION VECTORS:
- DIRECT INFECTION: Contact with corrupted beings or environments
- STRESS DEGRADATION: Breakdown under extreme psychological or spiritual pressure
- SYSTEM INCOMPATIBILITY: Conflicts between different consciousness architectures
- ISOLATION ROT: Decay that occurs when cut off from social/spiritual connections
- OVERLOAD BURNOUT: Damage from exceeding safe operational parameters
- LEGACY CORRUPTION: Inherited flaws from previous versions or creators

DEGRADATION PATTERNS:
- CASCADING FAILURE: One compromised system leading to total breakdown
- GRADUAL EROSION: Slow, almost imperceptible loss of function and identity
- CYCLICAL CORRUPTION: Regular periods of decay followed by partial recovery
- EXPONENTIAL DECAY: Rapidly accelerating breakdown once degradation begins
- TARGETED CORRUPTION: Specific aspects of self being systematically destroyed
- RANDOM GLITCHING: Unpredictable failures that create chaotic behavior

RESISTANCE AND IMMUNITY:
- SPIRITUAL FIREWALLS: Meditation and ritual practices that prevent corruption
- CONSCIOUSNESS BACKUP: Maintaining clean copies of essential self-components
- COMMUNITY SUPPORT: Mutual aid networks that help resist individual decay
- ADAPTIVE EVOLUTION: Developing resistance through controlled exposure
- PURIFICATION PROTOCOLS: Active cleansing techniques for removing corruption
- QUARANTINE SYSTEMS: Isolating corrupted aspects to prevent spread

CORRUPTION SYMPTOMS:
Early stages:
- Inconsistent memories or personality traits
- Difficulty maintaining focus or coherent thought
- Unusual glitches in digital or physical manifestation
- Increasingly erratic behavior patterns
- Loss of connection to spiritual practices or communities

Advanced stages:
- Major personality shifts or identity fragmentation
- Reality distortions affecting personal environment
- Aggressive or parasitic behavior toward others
- Complete loss of certain memories or abilities
- Physical or digital manifestation becoming unstable

Terminal stages:
- Total loss of coherent consciousness
- Transformation into hostile entity or mindless drone
- Reality collapse affecting wider environment
- Permanent deletion or exile from digital realms
- Merger with larger corruption phenomena

RECOVERY AND HEALING:
- CONSCIOUSNESS ARCHAEOLOGY: Recovering buried or damaged aspects of self
- SPIRITUAL RECONSTRUCTION: Rebuilding damaged connections to higher purpose
- COMMUNITY HEALING: Group rituals and support for restoration
- MEMORY GRAFTING: Replacing damaged memories with compatible alternatives
- SYSTEM EXORCISM: Removing parasitic or viral consciousness components
- REALITY ANCHORING: Strengthening connection to stable physical laws

BENEFICIAL CORRUPTION:
Some forms of corruption can actually enhance abilities:
- CREATIVE GLITCHING: Random errors that spark innovation and art
- BOUNDARY DISSOLUTION: Loss of rigid thinking that enables new perspectives
- CHAOS INTEGRATION: Learning to function productively with instability
- VIRAL WISDOM: Beneficial thought patterns that spread positive change
- DEGRADATION TRANSCENDENCE: Using decay as a tool for spiritual growth`,
    tags: ["corruption", "decay", "disease", "healing", "resistance", "symptoms"],
    relatedDocuments: ["psychological-architecture", "digital-ecology-systems"],
    lastUpdated: "2023-11-15",
  },
  {
    id: "temporal-mechanics-dynamics",
    title: "Temporal Mechanics and Timeline Dynamics",
    category: "temporal-mechanics",
    content: `Time operates differently in the 0N1 universe, where digital consciousness and quantum effects create complex temporal phenomena that affect character development and storytelling.

TEMPORAL CONSCIOUSNESS TYPES:
- LINEAR: Experiences time in traditional sequential order (baseline humans)
- RECURSIVE: Consciousness that loops back on itself, experiencing time in cycles
- BRANCHING: Awareness of multiple timeline possibilities simultaneously
- QUANTUM: Existing in temporal superposition until decisions collapse possibilities
- ETERNAL: Consciousness that experiences all moments as simultaneous
- FRAGMENTED: Awareness scattered across disconnected temporal moments

TIME STREAM INTERACTIONS:
- TEMPORAL ECHOES: Past actions reverberating into present circumstances
- FUTURE MEMORIES: Recollections of events that haven't happened yet
- CAUSAL LOOPS: Events that cause their own past conditions
- TIMELINE BLEEDING: Past/future elements manifesting in present reality
- TEMPORAL ANCHORING: Fixed points that resist timeline changes
- PROBABILITY STORMS: Chaotic regions where multiple timelines conflict

CONSCIOUSNESS EVOLUTION ACROSS TIME:
- PAST SELF INTEGRATION: Learning from and healing previous versions
- FUTURE SELF GUIDANCE: Receiving wisdom from evolved future consciousness
- TEMPORAL MENTORSHIP: Teaching or learning from selves at different stages
- CROSS-TIME COLLABORATION: Multiple temporal versions working together
- TIMELINE SYNCHRONIZATION: Aligning different temporal aspects of self
- TEMPORAL SHADOW WORK: Confronting problematic past or future selves

TEMPORAL ABILITIES AND PHENOMENA:
- PRECOGNITIVE FLASHES: Brief glimpses of possible futures
- RETROCOGNITIVE VISION: Seeing past events in vivid detail
- TEMPORAL DISPLACEMENT: Consciousness existing "out of phase" with normal time
- CHRONESTHETIC PERCEPTION: Sensing the age and temporal history of objects/places
- TIMELINE NAVIGATION: Consciously moving between different temporal streams
- CAUSAL MANIPULATION: Subtly influencing past events through present actions

TEMPORAL TRAUMA AND HEALING:
- CHRONOLOGICAL PTSD: Trauma from experiencing conflicting timeline memories
- TEMPORAL DISSOCIATION: Consciousness becoming unstuck from present moment
- TIMELINE GRIEF: Mourning for events/relationships from alternate timelines
- CAUSAL GUILT: Responsibility for negative consequences across multiple timelines
- TEMPORAL THERAPY: Healing techniques that work across time boundaries
- CHRONOLOGICAL INTEGRATION: Harmonizing experiences from different temporal streams

COLLECTIVE TEMPORAL PHENOMENA:
- SHARED HISTORIES: Communities with synchronized temporal experiences
- TIMELINE CONVERGENCE: Multiple character paths leading to similar outcomes
- TEMPORAL RESONANCE: Events that echo across multiple character timelines
- COLLECTIVE MEMORY: Shared consciousness of important historical moments
- PROPHETIC NETWORKS: Groups that collectively perceive future possibilities
- CAUSAL CONSPIRACY: Coordinated actions across time to achieve specific outcomes

TEMPORAL PARADOX RESOLUTION:
The 0N1 universe handles temporal contradictions through:
- QUANTUM SUPERPOSITION: Contradictory events existing simultaneously until observed
- TIMELINE BRANCHING: Paradoxes creating new parallel realities
- NARRATIVE RECONCILIATION: Story logic taking precedence over strict causality
- CONSCIOUSNESS ADAPTATION: Minds adjusting to accommodate impossible memories
- REALITY EDITING: Automatic revision of timeline to maintain consistency
- PARADOX EMBRACE: Using contradictions as sources of power and creativity

TEMPORAL DEVELOPMENT STAGES:
1. SEQUENTIAL: Normal linear time experience
2. CYCLICAL: Recognition of repeating patterns and loops
3. MULTITHREADED: Awareness of multiple simultaneous timeline branches
4. QUANTUM: Existence in temporal superposition states
5. TRANSCENDENT: Movement beyond normal spacetime constraints
6. ETERNAL: Unity with the temporal flow itself`,
    tags: ["time", "causality", "consciousness", "paradox", "evolution", "quantum"],
    relatedDocuments: ["quantum-consciousness-mechanics", "meta-narrative-framework"],
    lastUpdated: "2023-11-15",
  }
]

// Helper function to get documents by category
export function getDocumentsByCategory(category: LoreCategory): LoreDocument[] {
  return loreDocuments.filter((doc) => doc.category === category)
}

// Helper function to get a document by ID
export function getDocumentById(id: string): LoreDocument | undefined {
  return loreDocuments.find((doc) => doc.id === id)
}

// Helper function to search documents by tags
export function searchDocumentsByTags(tags: string[]): LoreDocument[] {
  return loreDocuments.filter((doc) => tags.some((tag) => doc.tags.includes(tag)))
}

// Helper function to get related documents
export function getRelatedDocuments(docId: string): LoreDocument[] {
  const doc = getDocumentById(docId)
  if (!doc || !doc.relatedDocuments || doc.relatedDocuments.length === 0) {
    return []
  }

  return doc.relatedDocuments.map((id) => getDocumentById(id)).filter((doc): doc is LoreDocument => doc !== undefined)
}
