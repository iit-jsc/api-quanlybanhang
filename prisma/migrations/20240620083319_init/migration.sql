-- AddForeignKey
ALTER TABLE "MeasurementUnit" ADD CONSTRAINT "MeasurementUnit_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeasurementUnit" ADD CONSTRAINT "MeasurementUnit_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
