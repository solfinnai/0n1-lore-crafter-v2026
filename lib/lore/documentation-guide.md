# 0N1 Soul Generator Lore Documentation Guide

This guide explains how to maintain and update the lore documentation for the 0N1 Soul Generator application to ensure AI suggestions remain consistent and high-quality.

## Documentation Structure

The lore is organized in the following structure:

1. **Core Documentation File**: `lib/lore/documentation.ts` contains all lore documents in a structured format.

2. **Document Types**: Each document has the following properties:
   - `id`: Unique identifier for the document
   - `title`: Human-readable title
   - `category`: The category the document belongs to
   - `content`: The actual lore content
   - `tags`: Keywords for searching and relevance
   - `relatedDocuments`: IDs of related documents (optional)
   - `lastUpdated`: Date of last update

3. **Categories**: Documents are organized into categories like:
   - `world-building`: General setting information
   - `character-archetypes`: Character types and roles
   - `history`: Timeline and historical events
   - `technology`: Tech systems and innovations
   - `spirituality`: Spiritual concepts and practices
   - `factions`: Groups and organizations
   - `locations`: Places and environments
   - `powers`: Abilities and power systems
   - `terminology`: Important terms and concepts
   - `narrative-style`: Writing style and tone guidelines

## How to Add New Lore

1. **Create a New Document**:
   - Add a new entry to the `loreDocuments` array in `lib/lore/documentation.ts`
   - Assign a unique `id` that describes the content
   - Choose the appropriate `category`
   - Add relevant `tags` for search and relevance
   - Write detailed `content` following the style guidelines

2. **Update Existing Documents**:
   - Find the document by `id`
   - Update the content as needed
   - Add new tags if relevant
   - Update the `lastUpdated` date

3. **Link Related Documents**:
   - Use the `relatedDocuments` array to link to other relevant documents
   - This helps the AI understand connections between different lore elements

## Content Guidelines

When writing lore content, follow these guidelines:

1. **Consistency**: Ensure new content doesn't contradict existing lore
2. **Specificity**: Be detailed and specific rather than vague
3. **Style**: Maintain the cyberpunk-mystical tone that blends technology and spirituality
4. **Structure**: Use clear paragraphs and bullet points for readability
5. **Terminology**: Use established terms consistently (Soul-Code, The Merge, etc.)

## Example Document

\`\`\`typescript
{
  id: "digital-yokai",
  title: "Digital Yokai: Spirits of the Network",
  category: "spirituality",
  content: `Digital Yokai are spiritual entities that have manifested within the digital realm following The Great Merge. Unlike simple AI or programs, these beings possess a form of consciousness that bridges the gap between code and spirit.

Digital Yokai take many forms, often inspired by traditional Japanese mythology but rendered in digital aesthetics - a kitsune might appear with circuitry patterns in its fur and data streams for tails, while a kappa might manifest as a water-based firewall entity that guards specific network nodes.

Temple monks have developed rituals to communicate with and sometimes bind these entities, while the Neon Syndicate has attempted to capture and weaponize them. Most Digital Yokai reside in the deeper layers of the network, particularly in ancient code structures or the Quantum Fold.

Encountering a Digital Yokai is considered both an opportunity and a danger - they can grant unique abilities or insights into the network, but they can also corrupt one's Soul-Code or lead travelers astray into data-loops from which few return.`,
  tags: ["spirits", "entities", "mythology", "digital-realm", "dangers"],
  relatedDocuments: ["quantum-fold", "temple-rituals", "soul-code"],
  lastUpdated: "2023-11-15"
}
\`\`\`

## Prompt Engineering

The lore documentation is used by the prompt engineering system in `lib/ai/prompt-engineering.ts` to create enhanced prompts for the AI. The system:

1. Determines which lore is relevant based on the current step in character creation
2. Incorporates character-specific information
3. Adds stylistic guidelines
4. Formats everything into a comprehensive system prompt

When updating lore, consider how it will be used in different character creation steps and tag documents accordingly.

## Maintenance Schedule

To keep the lore fresh and consistent:

1. Review all documents quarterly
2. Update `lastUpdated` dates when changes are made
3. Check for internal consistency across documents
4. Add new documents as the lore expands
5. Archive outdated documents rather than deleting them

## Testing Changes

After updating lore:

1. Test the AI suggestions for affected character creation steps
2. Verify that the new content is being incorporated appropriately
3. Check that the tone and style remain consistent
4. Ensure the AI doesn't generate contradictory information

By following these guidelines, we can maintain a rich, consistent lore that enhances the AI suggestions and creates a more immersive experience for users of the 0N1 Soul Generator.
