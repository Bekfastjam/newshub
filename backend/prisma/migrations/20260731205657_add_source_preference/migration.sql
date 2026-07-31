-- CreateTable
CREATE TABLE "SourcePreference" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourcePreference_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SourcePreference" ADD CONSTRAINT "SourcePreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
