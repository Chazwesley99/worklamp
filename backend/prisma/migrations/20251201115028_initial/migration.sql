-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "authProvider" TEXT NOT NULL DEFAULT 'email',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailOptIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "subscriptionTier" TEXT NOT NULL DEFAULT 'free',
    "maxProjects" INTEGER NOT NULL DEFAULT 1,
    "maxTeamMembers" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantMember" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "publicBugTracking" BOOLEAN NOT NULL DEFAULT false,
    "publicFeatureRequests" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "estimatedCompletionDate" TIMESTAMP(3) NOT NULL,
    "actualCompletionDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'planned',
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "milestoneId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "ownerId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskAssignment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bug" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT,
    "imageUrl" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'open',
    "votes" INTEGER NOT NULL DEFAULT 0,
    "ownerId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bug_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BugAssignment" (
    "id" TEXT NOT NULL,
    "bugId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BugAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BugVote" (
    "id" TEXT NOT NULL,
    "bugId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BugVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureRequest" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "ownerId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureAssignment" (
    "id" TEXT NOT NULL,
    "featureRequestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureVote" (
    "id" TEXT NOT NULL,
    "featureRequestId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelPermission" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "canPost" BOOLEAN NOT NULL DEFAULT true,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "color" TEXT,
    "positionX" INTEGER,
    "positionY" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnvVar" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnvVar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeOrder" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChangeOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "apiKey" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Tenant_ownerId_idx" ON "Tenant"("ownerId");

-- CreateIndex
CREATE INDEX "TenantMember_tenantId_idx" ON "TenantMember"("tenantId");

-- CreateIndex
CREATE INDEX "TenantMember_userId_idx" ON "TenantMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantMember_tenantId_userId_key" ON "TenantMember"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "Project_tenantId_idx" ON "Project"("tenantId");

-- CreateIndex
CREATE INDEX "Milestone_projectId_idx" ON "Milestone"("projectId");

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");

-- CreateIndex
CREATE INDEX "Task_milestoneId_idx" ON "Task"("milestoneId");

-- CreateIndex
CREATE INDEX "Task_createdById_idx" ON "Task"("createdById");

-- CreateIndex
CREATE INDEX "TaskAssignment_taskId_idx" ON "TaskAssignment"("taskId");

-- CreateIndex
CREATE INDEX "TaskAssignment_userId_idx" ON "TaskAssignment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskAssignment_taskId_userId_key" ON "TaskAssignment"("taskId", "userId");

-- CreateIndex
CREATE INDEX "Bug_projectId_idx" ON "Bug"("projectId");

-- CreateIndex
CREATE INDEX "Bug_createdById_idx" ON "Bug"("createdById");

-- CreateIndex
CREATE INDEX "BugAssignment_bugId_idx" ON "BugAssignment"("bugId");

-- CreateIndex
CREATE INDEX "BugAssignment_userId_idx" ON "BugAssignment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BugAssignment_bugId_userId_key" ON "BugAssignment"("bugId", "userId");

-- CreateIndex
CREATE INDEX "BugVote_bugId_idx" ON "BugVote"("bugId");

-- CreateIndex
CREATE INDEX "BugVote_userId_idx" ON "BugVote"("userId");

-- CreateIndex
CREATE INDEX "BugVote_ipAddress_idx" ON "BugVote"("ipAddress");

-- CreateIndex
CREATE INDEX "FeatureRequest_projectId_idx" ON "FeatureRequest"("projectId");

-- CreateIndex
CREATE INDEX "FeatureRequest_createdById_idx" ON "FeatureRequest"("createdById");

-- CreateIndex
CREATE INDEX "FeatureAssignment_featureRequestId_idx" ON "FeatureAssignment"("featureRequestId");

-- CreateIndex
CREATE INDEX "FeatureAssignment_userId_idx" ON "FeatureAssignment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureAssignment_featureRequestId_userId_key" ON "FeatureAssignment"("featureRequestId", "userId");

-- CreateIndex
CREATE INDEX "FeatureVote_featureRequestId_idx" ON "FeatureVote"("featureRequestId");

-- CreateIndex
CREATE INDEX "FeatureVote_userId_idx" ON "FeatureVote"("userId");

-- CreateIndex
CREATE INDEX "FeatureVote_ipAddress_idx" ON "FeatureVote"("ipAddress");

-- CreateIndex
CREATE INDEX "Comment_resourceType_resourceId_idx" ON "Comment"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Channel_projectId_idx" ON "Channel"("projectId");

-- CreateIndex
CREATE INDEX "Channel_createdById_idx" ON "Channel"("createdById");

-- CreateIndex
CREATE INDEX "ChannelPermission_channelId_idx" ON "ChannelPermission"("channelId");

-- CreateIndex
CREATE INDEX "ChannelPermission_userId_idx" ON "ChannelPermission"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelPermission_channelId_userId_key" ON "ChannelPermission"("channelId", "userId");

-- CreateIndex
CREATE INDEX "Message_channelId_idx" ON "Message"("channelId");

-- CreateIndex
CREATE INDEX "Message_userId_idx" ON "Message"("userId");

-- CreateIndex
CREATE INDEX "Note_userId_idx" ON "Note"("userId");

-- CreateIndex
CREATE INDEX "EnvVar_projectId_idx" ON "EnvVar"("projectId");

-- CreateIndex
CREATE INDEX "EnvVar_createdById_idx" ON "EnvVar"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "EnvVar_projectId_key_environment_key" ON "EnvVar"("projectId", "key", "environment");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "ChangeOrder_projectId_idx" ON "ChangeOrder"("projectId");

-- CreateIndex
CREATE INDEX "ChangeOrder_milestoneId_idx" ON "ChangeOrder"("milestoneId");

-- CreateIndex
CREATE INDEX "ChangeOrder_createdById_idx" ON "ChangeOrder"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "AIConfig_tenantId_key" ON "AIConfig"("tenantId");

-- CreateIndex
CREATE INDEX "AIConfig_tenantId_idx" ON "AIConfig"("tenantId");

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantMember" ADD CONSTRAINT "TenantMember_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantMember" ADD CONSTRAINT "TenantMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bug" ADD CONSTRAINT "Bug_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bug" ADD CONSTRAINT "Bug_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BugAssignment" ADD CONSTRAINT "BugAssignment_bugId_fkey" FOREIGN KEY ("bugId") REFERENCES "Bug"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BugAssignment" ADD CONSTRAINT "BugAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BugVote" ADD CONSTRAINT "BugVote_bugId_fkey" FOREIGN KEY ("bugId") REFERENCES "Bug"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BugVote" ADD CONSTRAINT "BugVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureRequest" ADD CONSTRAINT "FeatureRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureRequest" ADD CONSTRAINT "FeatureRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureAssignment" ADD CONSTRAINT "FeatureAssignment_featureRequestId_fkey" FOREIGN KEY ("featureRequestId") REFERENCES "FeatureRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureAssignment" ADD CONSTRAINT "FeatureAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureVote" ADD CONSTRAINT "FeatureVote_featureRequestId_fkey" FOREIGN KEY ("featureRequestId") REFERENCES "FeatureRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureVote" ADD CONSTRAINT "FeatureVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelPermission" ADD CONSTRAINT "ChannelPermission_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelPermission" ADD CONSTRAINT "ChannelPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvVar" ADD CONSTRAINT "EnvVar_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvVar" ADD CONSTRAINT "EnvVar_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeOrder" ADD CONSTRAINT "ChangeOrder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeOrder" ADD CONSTRAINT "ChangeOrder_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeOrder" ADD CONSTRAINT "ChangeOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIConfig" ADD CONSTRAINT "AIConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
