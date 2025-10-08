'use server';

/**
 * @fileOverview An AI agent that provides intelligent weather alerts based on historical data.
 *
 * - intelligentWeatherAlerts - A function that generates weather alerts.
 * - IntelligentWeatherAlertsInput - The input type for the intelligentWeatherAlerts function.
 * - IntelligentWeatherAlertsOutput - The return type for the intelligentWeatherAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentWeatherAlertsInputSchema = z.object({
  currentWeather: z
    .string()
    .describe('The current weather conditions (e.g., sunny, rainy, cloudy).'),
  temperature: z.number().describe('The current temperature in Celsius.'),
  historicalWeatherData: z
    .string()
    .describe(
      'Historical weather data for the location, including seasonal averages.'
    ),
  location: z.string().describe('The city and country of the location.'),
});
export type IntelligentWeatherAlertsInput = z.infer<
  typeof IntelligentWeatherAlertsInputSchema
>;

const IntelligentWeatherAlertsOutputSchema = z.object({
  alertMessage: z
    .string()
    .describe(
      'A message alerting the user to any unusual weather conditions based on historical data and seasonal averages.'
    ),
});
export type IntelligentWeatherAlertsOutput = z.infer<
  typeof IntelligentWeatherAlertsOutputSchema
>;

export async function intelligentWeatherAlerts(
  input: IntelligentWeatherAlertsInput
): Promise<IntelligentWeatherAlertsOutput> {
  return intelligentWeatherAlertsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentWeatherAlertsPrompt',
  input: {schema: IntelligentWeatherAlertsInputSchema},
  output: {schema: IntelligentWeatherAlertsOutputSchema},
  prompt: `You are an intelligent weather alert system.

You will analyze the current weather conditions, temperature, and historical weather data to determine if there are any unusual weather conditions.

Current Weather: {{{currentWeather}}}
Temperature: {{{temperature}}}°C
Historical Weather Data: {{{historicalWeatherData}}}
Location: {{{location}}}

Based on this information, generate an alert message if there are any unexpected cold snaps, chances of rain when it would normally be dry, or other unusual conditions. If the weather is normal, inform the user that the current conditions are normal for this time of year.
`,
});

const intelligentWeatherAlertsFlow = ai.defineFlow(
  {
    name: 'intelligentWeatherAlertsFlow',
    inputSchema: IntelligentWeatherAlertsInputSchema,
    outputSchema: IntelligentWeatherAlertsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
