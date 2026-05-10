-- AlterTable
ALTER TABLE `order` ADD COLUMN `billingAddress` VARCHAR(191) NULL,
    ADD COLUMN `billingName` VARCHAR(191) NULL,
    ADD COLUMN `billingRuc` VARCHAR(191) NULL,
    ADD COLUMN `billingType` VARCHAR(191) NULL,
    ADD COLUMN `paymentDetail` TEXT NULL;
