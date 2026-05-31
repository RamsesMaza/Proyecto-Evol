-- AlterTable
ALTER TABLE `user` ADD COLUMN `isFavorite` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'nuevo';

-- CreateTable
CREATE TABLE `Cotizacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `clienteId` INTEGER NULL,
    `clienteNombre` VARCHAR(191) NOT NULL,
    `clienteEmail` VARCHAR(191) NOT NULL,
    `clientePhone` VARCHAR(191) NULL,
    `clienteCompany` VARCHAR(191) NULL,
    `vendedorId` INTEGER NULL,
    `vendedorNombre` VARCHAR(191) NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `vencimiento` DATETIME(3) NOT NULL,
    `estado` ENUM('pendiente', 'aprobada', 'rechazada', 'expirada', 'revision') NOT NULL DEFAULT 'pendiente',
    `subtotal` DOUBLE NOT NULL DEFAULT 0,
    `descuento` DOUBLE NOT NULL DEFAULT 0,
    `impuesto` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL DEFAULT 0,
    `notas` TEXT NULL,
    `terminos` TEXT NULL,
    `metodoPago` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Cotizacion_codigo_key`(`codigo`),
    INDEX `Cotizacion_codigo_idx`(`codigo`),
    INDEX `Cotizacion_clienteId_idx`(`clienteId`),
    INDEX `Cotizacion_estado_idx`(`estado`),
    INDEX `Cotizacion_fecha_idx`(`fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CotizacionItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cotizacionId` INTEGER NOT NULL,
    `producto` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `cantidad` INTEGER NOT NULL DEFAULT 1,
    `precioUnit` DOUBLE NOT NULL DEFAULT 0,
    `descuento` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL DEFAULT 0,

    INDEX `CotizacionItem_cotizacionId_idx`(`cotizacionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CotizacionActividad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cotizacionId` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `usuario` VARCHAR(191) NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CotizacionActividad_cotizacionId_idx`(`cotizacionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `User_status_idx` ON `User`(`status`);

-- CreateIndex
CREATE INDEX `User_role_idx` ON `User`(`role`);

-- AddForeignKey
ALTER TABLE `CotizacionItem` ADD CONSTRAINT `CotizacionItem_cotizacionId_fkey` FOREIGN KEY (`cotizacionId`) REFERENCES `Cotizacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CotizacionActividad` ADD CONSTRAINT `CotizacionActividad_cotizacionId_fkey` FOREIGN KEY (`cotizacionId`) REFERENCES `Cotizacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
