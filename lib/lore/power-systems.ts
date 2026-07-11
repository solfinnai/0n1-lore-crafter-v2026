export interface PowerSystem {
  name: string
  description: string
  practitioners: string
  techniques: string[]
  limitations: string
}

export const powerSystems: PowerSystem[] = [
  {
    name: "Code Weaving",
    description: "The art of manipulating digital reality through specialized gestures, mantras, and focused intent",
    practitioners: "Primarily practiced by Temple monks and digital shamans",
    techniques: [
      "Reality Patching - Temporary alterations to local digital-physical space",
      "Thread Binding - Creating connections between separate digital entities",
      "Pattern Recognition - Seeing the underlying code of reality",
      "Compiler Manifestation - Summoning digital constructs into physical form",
    ],
    limitations:
      "Requires deep focus and spiritual-technical harmony; effects are temporary unless anchored to physical objects",
  },
  {
    name: "Soul Hacking",
    description: "Techniques for manipulating one's own or others' digital consciousness and identity",
    practitioners: "Phantom Network specialists and rogue identity artists",
    techniques: [
      "Persona Shifting - Temporarily adopting different digital identities",
      "Memory Grafting - Implanting or extracting specific memories",
      "Consciousness Fragmentation - Splitting awareness across multiple digital locations",
      "Emotional Firewall - Creating barriers against psychological manipulation",
    ],
    limitations: "Risks identity dissolution, psychological fragmentation, and spiritual corruption",
  },
  {
    name: "Quantum Channeling",
    description: "Harnessing the power of quantum uncertainty to affect probability and reality itself",
    practitioners: "Quantum Ascendancy cultists and specialized Code Ronin",
    techniques: [
      "Probability Cascade - Influencing likely outcomes in one's favor",
      "Superposition Stance - Existing in multiple potential states simultaneously",
      "Observer Effect - Manipulating reality by focused observation",
      "Entanglement Binding - Creating unbreakable connections between entities",
    ],
    limitations: "Highly unstable; can cause reality fractures and unintended consequences across timelines",
  },
]
