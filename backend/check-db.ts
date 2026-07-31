import dotenv from 'dotenv';
dotenv.config();

import { prisma } from './src/db';

async function main() {
  const total = await prisma.article.count();
  const summarized = await prisma.article.count({ where: { aiSummary: { not: null } } });
  const sample = await prisma.article.findFirst({ where: { aiSummary: { not: null } } });
  
  console.log(`📊 Total articles: ${total}`);
  console.log(`✅ Summarized: ${summarized}`);
  console.log(`❌ Not summarized: ${total - summarized}`);
  
  if (sample) {
    console.log(`\n📝 Sample summary:\n${sample.aiSummary}`);
  } else {
    console.log('\n⚠️  No summarized articles found!');
  }

  await prisma.$disconnect();
}

main().catch(console.error);
