-- Add updated_at to tasks (notes already has it)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Enable moddatetime extension for auto-updating updated_at columns
CREATE EXTENSION IF NOT EXISTS moddatetime;

-- Trigger: auto-update updated_at on tasks
CREATE OR REPLACE TRIGGER handle_updated_at_tasks
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Trigger: auto-update updated_at on notes
CREATE OR REPLACE TRIGGER handle_updated_at_notes
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Trigger: auto-update updated_at on events
ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE OR REPLACE TRIGGER handle_updated_at_events
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);
