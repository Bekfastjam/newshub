
export interface FeedSource {
    name: string;
    url: string;
    category: string;
}

export const feedSources: FeedSource[] = [
    { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/rss.xml', category: 'general' },
    { name: 'BBC Sport', url: 'http://feeds.bbci.co.uk/sport/rss.xml', category: 'sports' },
    { name: 'BBC Technology', url: 'http://feeds.bbci.co.uk/news/technology/rss.xml', category: 'technology' },
    { name: 'BBC Business', url: 'http://feeds.bbci.co.uk/news/business/rss.xml', category: 'business' },

    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'technology' },
    { name: 'ESPN', url: 'https://www.espn.com/espn/rss/news', category: 'sports' },

    { name: 'NPR', url: 'https://feeds.npr.org/1001/rss.xml', category: 'general' },
    { name: 'NPR Business', url: 'https://feeds.npr.org/1006/rss.xml', category: 'business' },
    { name: 'NPR Technology', url: 'https://feeds.npr.org/1019/rss.xml', category: 'technology' },
    { name: 'NPR Science', url: 'https://feeds.npr.org/1007/rss.xml', category: 'science' },

    { name: 'CBS News', url: 'https://www.cbsnews.com/latest/rss/main', category: 'general' },
    { name: 'CBS Sports', url: 'https://www.cbsnews.com/latest/rss/sports', category: 'sports' },
    { name: 'CBS Technology', url: 'https://www.cbsnews.com/latest/rss/technology', category: 'technology' },
    { name: 'CBS Business', url: 'https://www.cbsnews.com/latest/rss/moneywatch', category: 'business' },

    { name: 'PBS NewsHour', url: 'https://www.pbs.org/newshour/feeds/rss/headlines', category: 'general' },

    { name: 'Fox Business', url: 'https://moxie.foxbusiness.com/google-publisher/latest.xml', category: 'business' },

    { name: 'The New York Times', url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', category: 'general' },
    { name: 'NYT Sports', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml', category: 'sports' },
    { name: 'NYT Technology', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', category: 'technology' },
    { name: 'NYT Business', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', category: 'business' },
    { name: 'NYT Science', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', category: 'science' },

    { name: 'New York Post', url: 'https://nypost.com/feed/', category: 'general' },
    { name: 'Business Insider', url: 'https://www.businessinsider.com/rss', category: 'business' },
    { name: 'The Wall Street Journal', url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', category: 'business' },
    { name: 'Gazeta.uz', url: 'https://www.gazeta.uz/en/rss/', category: 'general' },
];
