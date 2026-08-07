// Maps a display-friendly "brand" name to all its underlying source names in the DB.
// Use this to expand a single brand checkbox into multiple ?source= values.

export const sourceGroups: Record<string, string[]> = {
  'BBC': ['BBC News', 'BBC Sport', 'BBC Technology', 'BBC Business'],
  'NYT': ['The New York Times', 'NYT Sports', 'NYT Technology', 'NYT Business', 'NYT Science'],
  'CBS News': ['CBS News', 'CBS Sports', 'CBS Technology', 'CBS Business'],
  'NPR': ['NPR', 'NPR Business', 'NPR Technology', 'NPR Science'],
  'TechCrunch': ['TechCrunch'],
  'ESPN': ['ESPN'],
  'PBS NewsHour': ['PBS NewsHour'],
  'Fox Business': ['Fox Business'],
  'New York Post': ['New York Post'],
  'Business Insider': ['Business Insider'],
  'The Wall Street Journal': ['The Wall Street Journal'],
  'Gazeta.uz': ['Gazeta.uz'],
};

// Helper: given selected brand names, return the flat list of real source values to send to the API
export function expandSourceSelection(selectedBrands: string[]): string[] {
  return selectedBrands.flatMap((brand) => sourceGroups[brand] ?? [brand]);
}
