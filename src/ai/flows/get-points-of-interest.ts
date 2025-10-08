'use server';

/**
 * @fileOverview An AI agent that finds points of interest for travelers.
 *
 * - getPointsOfInterest - A function that finds points of interest.
 * - GetPointsOfInterestInput - The input type for the getPointsOfInterest function.
 * - GetPointsOfInterestOutput - The return type for the getPointsOfInterest function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetPointsOfInterestInputSchema = z.object({
  location: z.string().describe('The city and country to search for points of interest in.'),
});
export type GetPointsOfInterestInput = z.infer<typeof GetPointsOfInterestInputSchema>;

const GetPointsOfInterestOutputSchema = z.object({
  pointsOfInterest: z.array(z.object({
    name: z.string().describe('The name of the point of interest.'),
    type: z.enum(['Park', 'Airport', 'Market', 'Landmark', 'Attraction']).describe('The category of the point of interest.'),
    description: z.string().describe('A brief, one-sentence description of the point of interest.'),
  })).describe('A list of up to 5 points of interest for a traveler in the given location.')
});
export type GetPointsOfInterestOutput = z.infer<typeof GetPointsOfInterestOutputSchema>;

export async function getPointsOfInterest(
  input: GetPointsOfInterestInput
): Promise<GetPointsOfInterestOutput> {
  return getPoisFlow(input);
}

const poisPrompt = ai.definePrompt({
  name: 'poisPrompt',
  input: { schema: GetPointsOfInterestInputSchema },
  output: { schema: GetPointsOfInterestOutputSchema },
  prompt: `You are a travel assistant. List up to 5 essential points of interest for a traveler in {{{location}}}. Include a mix of types like airports, parks, and markets. For each, provide its name, type, and a brief, one-sentence description.`,
});

const getPoisFlow = ai.defineFlow(
  {
    name: 'getPoisFlow',
    inputSchema: GetPointsOfInterestInputSchema,
    outputSchema: GetPointsOfInterestOutputSchema,
  },
  async input => {
    const { output } = await poisPrompt(input);
    return output!;
  }
);
