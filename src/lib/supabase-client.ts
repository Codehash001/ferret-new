// supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://embicapmjtddkceauzpz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtYmljYXBtanRkZGtjZWF1enB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI1NjExODMsImV4cCI6MjAxODEzNzE4M30.YkY-6rRqVlm2VI4embpxruidqj4IamJhfr8-Hypg6PA';

export const supabase = createClient(supabaseUrl, supabaseKey);
