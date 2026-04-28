-- CreateTable
CREATE TABLE "service_schedules" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "mon" BOOLEAN NOT NULL DEFAULT true,
    "tue" BOOLEAN NOT NULL DEFAULT true,
    "wed" BOOLEAN NOT NULL DEFAULT true,
    "thu" BOOLEAN NOT NULL DEFAULT true,
    "fri" BOOLEAN NOT NULL DEFAULT true,
    "sat" BOOLEAN NOT NULL DEFAULT true,
    "sun" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_blocked_dates" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_blocked_dates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_schedules_serviceId_key" ON "service_schedules"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "service_blocked_dates_serviceId_date_key" ON "service_blocked_dates"("serviceId", "date");

-- AddForeignKey
ALTER TABLE "service_schedules" ADD CONSTRAINT "service_schedules_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_blocked_dates" ADD CONSTRAINT "service_blocked_dates_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
