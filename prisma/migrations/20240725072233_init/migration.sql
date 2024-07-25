-- AddForeignKey
ALTER TABLE "TableSalary" ADD CONSTRAINT "TableSalary_confirmBy_fkey" FOREIGN KEY ("confirmBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
