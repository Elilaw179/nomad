'use server';

/**
 * @fileOverview An AI agent that finds hotels in a specific location.
 *
 * - getHotels - A function that finds hotels.
 * - GetHotelsInput - The input type for the getHotels function.
 * - GetHotelsOutput - The return type for the getHotels function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetHotelsInputSchema = z.object({
  location: z.string().describe('The city and country to search for hotels in.'),
});
export type GetHotelsInput = z.infer<typeof GetHotelsInputSchema>;

const GetHotelsOutputSchema = z.object({
  hotels: z.array(z.string()).describe('A list of 5 well-known hotel names in the given location.'),
});
export type GetHotelsOutput = z.infer<typeof GetHotelsOutputSchema>;

export async function getHotels(
  input: GetHotelsInput
): Promise<GetHotelsOutput> {
  return getHotelsFlow(input);
}

const hotelsPrompt = ai.definePrompt({
  name: 'hotelsPrompt',
  input: { schema: GetHotelsInputSchema },
  output: { schema: GetHotelsOutputSchema },
  prompt: `List exactly 5 well-known hotels or lodging options available in {{{location}}}. Just provide the names.`,
});

const getHotelsFlow = ai.defineFlow(
  {
    name: 'getHotelsFlow',
    inputSchema: GetHotelsInputSchema,
    outputSchema: GetHotelsOutputSchema,
  },
  async input => {
    const { output } = await hotelsPrompt(input);
    return output!;
  }
);
