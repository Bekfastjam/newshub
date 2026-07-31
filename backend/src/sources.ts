export interface FeedSource {
    name: string;
    url: string;
    category: string;
}

export const feedSources: FeedSource[] = [
    { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/rss.xml', category: 'general' },
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'technology' },
    { name: 'ESPN', url: 'https://www.espn.com/espn/rss/news', category: 'sports' },
    { name: 'NPR', url: 'https://feeds.npr.org/1001/rss.xml', category: 'general' },
];
