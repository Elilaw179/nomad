'use server';

/**
 * @fileOverview An AI agent that provides a description for a given location.
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
  output: {schema: GetLocationDetailsOutputSchema},
  prompt: `Generate a brief, engaging, one-paragraph description for the following location: {{{location}}}. Focus on what makes it unique, like a famous landmark, its culture, or natural beauty.`,
});

const getLocationDetailsFlow = ai.defineFlow(
  {
    name: 'getLocationDetailsFlow',
    inputSchema: GetLocationDetailsInputSchema,
    outputSchema: GetLocationDetailsOutputSchema,
  },
  async input => {
    const descriptionResult = await descriptionPrompt(input);
    return descriptionResult.output!;
  }
);
