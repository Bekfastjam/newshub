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
    { name: 'CBS News', url: 'https://www.cbsnews.com/latest/rss/main', category: 'general' },
    { name: 'PBS NewsHour', url: 'https://www.pbs.org/newshour/feeds/rss/headlines', category: 'general' },
    { name: 'Fox Business', url: 'https://moxie.foxbusiness.com/google-publisher/latest.xml', category: 'business' },
    { name: 'The New York Times', url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', category: 'general' },
    { name: 'New York Post', url: 'https://nypost.com/feed/', category: 'general' },
    { name: 'Business Insider', url: 'https://www.businessinsider.com/rss', category: 'business' },
    { name: 'The Wall Street Journal', url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', category: 'business' },
];
