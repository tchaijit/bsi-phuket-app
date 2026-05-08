-- Migration: Add partner_type column to partners table
-- Created: 2026-05-08

-- Add partner_type column with default value 'partner'
ALTER TABLE partners
ADD COLUMN partner_type VARCHAR(20) NOT NULL DEFAULT 'partner';

-- Add CHECK constraint
ALTER TABLE partners
ADD CONSTRAINT partners_partner_type_check
CHECK (partner_type IN ('partner', 'competitor', 'opportunity'));

-- Create index for better filtering performance
CREATE INDEX IF NOT EXISTS idx_partners_partner_type ON partners(partner_type);

-- Update existing records to have appropriate partner_type
-- You can customize this based on your data
-- Example: Mark competitors based on certain criteria
-- UPDATE partners SET partner_type = 'competitor' WHERE category = 'hospital' AND ... ;

-- Add comment to column
COMMENT ON COLUMN partners.partner_type IS 'Type of entity: partner (current partner), competitor (competing entity), or opportunity (potential partner)';
