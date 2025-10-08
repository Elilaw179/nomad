'use server';

/**
 * @fileOverview An AI agent that provides a description and an image for a given location.
 *
 * - getLocationDetails - A function that generates location details.
 * - GetLocationDetailsInput - The input type for the getLocationDetails function.
 * - GetLocationDetailsOutput - The return type for the getLocationDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetLocationDetailsInputSchema = z.object({
  location: z.string().describe('The city and country of the location.'),
});
export type GetLocationDetailsInput = z.infer<
  typeof GetLocationDetailsInputSchema
>;

const GetLocationDetailsOutputSchema = z.object({
  description: z
    .string()
    .describe('A brief and engaging description of the location.'),
  imageUrl: z
    .string()
    .describe('A data URI of a generated image representing the location.'),
});
export type GetLocationDetailsOutput = z.infer<
  typeof GetLocationDetailsOutputSchema
>;

export async function getLocationDetails(
  input: GetLocationDetailsInput
): Promise<GetLocationDetailsOutput> {
  return getLocationDetailsFlow(input);
}

const descriptionPrompt = ai.definePrompt({
  name: 'locationDescriptionPrompt',
  input: {schema: GetLocationDetailsInputSchema},
  output: {schema: z.object({ description: GetLocationDetailsOutputSchema.shape.description })},
  prompt: `Generate a brief, engaging, one-paragraph description for the following location: {{{location}}}. Focus on what makes it unique, like a famous landmark, its culture, or natural beauty.`,
});

const imagePromptTemplate = ai.definePrompt({
  name: 'locationImagePrompt',
  input: {schema: GetLocationDetailsInputSchema},
  prompt: `A beautiful, vibrant, high-quality photograph of {{{location}}}. Cinematic, professional photography.`,
});


const getLocationDetailsFlow = ai.defineFlow(
  {
    name: 'getLocationDetailsFlow',
    inputSchema: GetLocationDetailsInputSchema,
    outputSchema: GetLocationDetailsOutputSchema,
  },
  async input => {
    const [descriptionResult, imagePrompt] = await Promise.all([
        descriptionPrompt(input),
        imagePromptTemplate(input)
    ]);
    
    const imageResult = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: imagePrompt.output!,
    });
    
    const description = descriptionResult.output?.description || '';
    const imageUrl = imageResult.media.url;

    return {
      description,
      imageUrl,
    };
  }
);
