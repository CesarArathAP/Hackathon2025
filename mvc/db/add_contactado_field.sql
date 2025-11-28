-- Script para agregar el campo contactado a la tabla diagnosticos
-- Ejecutar este script en la base de datos si el campo no existe

ALTER TABLE `diagnosticos` 
ADD COLUMN `contactado` TINYINT(1) DEFAULT 1 COMMENT '1 = Pendiente, 0 = Contactado' 
AFTER `tiempo`;

-- Actualizar los registros existentes para que tengan el valor por defecto
UPDATE `diagnosticos` SET `contactado` = 1 WHERE `contactado` IS NULL;
