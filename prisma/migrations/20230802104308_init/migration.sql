-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "refreshToken" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoShare" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "thumbnailUrls" TEXT NOT NULL,
    "upvote" INTEGER NOT NULL DEFAULT 0,
    "downvote" INTEGER NOT NULL DEFAULT 0,
    "sharedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sharedById" TEXT NOT NULL,

    CONSTRAINT "VideoShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_upvote_user" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_updown_user" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_upvote_user_AB_unique" ON "_upvote_user"("A", "B");

-- CreateIndex
CREATE INDEX "_upvote_user_B_index" ON "_upvote_user"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_updown_user_AB_unique" ON "_updown_user"("A", "B");

-- CreateIndex
CREATE INDEX "_updown_user_B_index" ON "_updown_user"("B");

-- AddForeignKey
ALTER TABLE "VideoShare" ADD CONSTRAINT "VideoShare_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_upvote_user" ADD CONSTRAINT "_upvote_user_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_upvote_user" ADD CONSTRAINT "_upvote_user_B_fkey" FOREIGN KEY ("B") REFERENCES "VideoShare"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_updown_user" ADD CONSTRAINT "_updown_user_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_updown_user" ADD CONSTRAINT "_updown_user_B_fkey" FOREIGN KEY ("B") REFERENCES "VideoShare"("id") ON DELETE CASCADE ON UPDATE CASCADE;
