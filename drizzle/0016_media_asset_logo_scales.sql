ALTER TABLE `media_assets`
  ADD COLUMN `navigationLogoScale` int DEFAULT 100,
  ADD COLUMN `footerLogoScale` int DEFAULT 100,
  ADD COLUMN `adminLoginLogoScale` int DEFAULT 100,
  ADD COLUMN `adminSidebarLogoScale` int DEFAULT 100;
