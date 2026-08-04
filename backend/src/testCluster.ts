import { clusterArticles } from './clusterArticles';

clusterArticles()
    .then(() => {
        console.log('Test cluster run finished.');
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
