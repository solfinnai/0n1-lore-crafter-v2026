-- 0N1 Lore Crafter Database Schema
-- Migration: Create all necessary tables for character storage

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create character_souls table (main character data)
CREATE TABLE character_souls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nft_id VARCHAR(10) NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  character_name VARCHAR(255),
  archetype VARCHAR(100),
  background TEXT,
  personality_data JSONB NOT NULL DEFAULT '{}',
  traits JSONB NOT NULL DEFAULT '[]',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_nft_wallet UNIQUE(nft_id, wallet_address),
  CONSTRAINT valid_wallet_address CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
  CONSTRAINT valid_nft_id CHECK (nft_id ~ '^[0-9]+$')
);

-- Create indexes for character_souls
CREATE INDEX idx_character_souls_wallet ON character_souls(wallet_address);
CREATE INDEX idx_character_souls_nft_id ON character_souls(nft_id);
CREATE INDEX idx_character_souls_created_at ON character_souls(created_at DESC);

-- Create conversation_memory table (chat history and key memories)
CREATE TABLE conversation_memory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nft_id VARCHAR(10) NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  character_name VARCHAR(255),
  messages JSONB NOT NULL DEFAULT '[]',
  key_memories JSONB NOT NULL DEFAULT '[]',
  user_profile JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_memory_nft_wallet UNIQUE(nft_id, wallet_address),
  CONSTRAINT valid_memory_wallet_address CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
  CONSTRAINT valid_memory_nft_id CHECK (nft_id ~ '^[0-9]+$')
);

-- Create indexes for conversation_memory
CREATE INDEX idx_conversation_memory_nft_wallet ON conversation_memory(nft_id, wallet_address);
CREATE INDEX idx_conversation_memory_updated_at ON conversation_memory(updated_at DESC);

-- Create memory_segments table (saved text selections)
CREATE TABLE memory_segments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nft_id VARCHAR(10) NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  message_id VARCHAR(255),
  text_content TEXT NOT NULL,
  start_index INTEGER DEFAULT 0,
  end_index INTEGER DEFAULT 0,
  tags JSONB NOT NULL DEFAULT '[]',
  importance INTEGER CHECK (importance >= 1 AND importance <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_segments_wallet_address CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
  CONSTRAINT valid_segments_nft_id CHECK (nft_id ~ '^[0-9]+$'),
  CONSTRAINT valid_importance CHECK (importance IS NULL OR (importance >= 1 AND importance <= 10))
);

-- Create indexes for memory_segments
CREATE INDEX idx_memory_segments_nft_wallet ON memory_segments(nft_id, wallet_address);
CREATE INDEX idx_memory_segments_tags ON memory_segments USING GIN(tags);
CREATE INDEX idx_memory_segments_importance ON memory_segments(importance DESC);
CREATE INDEX idx_memory_segments_created_at ON memory_segments(created_at DESC);

-- Create chat_archives table (archived conversation sessions)
CREATE TABLE chat_archives (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  character_id VARCHAR(10) NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  character_name VARCHAR(255),
  title VARCHAR(500),
  summary TEXT,
  messages JSONB NOT NULL DEFAULT '[]',
  memory_segments JSONB NOT NULL DEFAULT '[]',
  metadata JSONB NOT NULL DEFAULT '{}',
  session_start TIMESTAMP WITH TIME ZONE,
  session_end TIMESTAMP WITH TIME ZONE,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_archives_wallet_address CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
  CONSTRAINT valid_archives_character_id CHECK (character_id ~ '^[0-9]+$'),
  CONSTRAINT valid_message_count CHECK (message_count >= 0)
);

-- Create indexes for chat_archives
CREATE INDEX idx_chat_archives_character_wallet ON chat_archives(character_id, wallet_address);
CREATE INDEX idx_chat_archives_created_at ON chat_archives(created_at DESC);
CREATE INDEX idx_chat_archives_session_start ON chat_archives(session_start DESC);

-- Create memory_profiles table (enhanced memory system)
CREATE TABLE memory_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nft_id VARCHAR(10) NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  context_entries JSONB NOT NULL DEFAULT '[]',
  tag_management JSONB NOT NULL DEFAULT '{}',
  character_evolution JSONB NOT NULL DEFAULT '{}',
  overview_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_profile_nft_wallet UNIQUE(nft_id, wallet_address),
  CONSTRAINT valid_profiles_wallet_address CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
  CONSTRAINT valid_profiles_nft_id CHECK (nft_id ~ '^[0-9]+$')
);

-- Create indexes for memory_profiles
CREATE INDEX idx_memory_profiles_nft_wallet ON memory_profiles(nft_id, wallet_address);
CREATE INDEX idx_memory_profiles_updated_at ON memory_profiles(updated_at DESC);

-- Create triggers to automatically update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to relevant tables
CREATE TRIGGER update_character_souls_updated_at 
    BEFORE UPDATE ON character_souls 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_memory_updated_at 
    BEFORE UPDATE ON conversation_memory 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memory_profiles_updated_at 
    BEFORE UPDATE ON memory_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE character_souls ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for wallet-based access control
-- Users can only access their own data based on wallet_address

-- Character souls policies
CREATE POLICY "Users can view their own character souls" ON character_souls
    FOR SELECT USING (wallet_address = current_user OR wallet_address = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'));

CREATE POLICY "Users can insert their own character souls" ON character_souls
    FOR INSERT WITH CHECK (wallet_address = current_user OR wallet_address = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'));

CREATE POLICY "Users can update their own character souls" ON character_souls
    FOR UPDATE USING (wallet_address = current_user OR wallet_address = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'));

CREATE POLICY "Users can delete their own character souls" ON character_souls
    FOR DELETE USING (wallet_address = current_user OR wallet_address = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'));

-- Conversation memory policies
CREATE POLICY "Users can view their own conversation memory" ON conversation_memory
    FOR SELECT USING (wallet_address = current_user OR wallet_address = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'));

CREATE POLICY "Users can insert their own conversation memory" ON conversation_memory
    FOR INSERT WITH CHECK (wallet_address = current_user OR wallet_address = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'));

CREATE POLICY "Users can update their own conversation memory" ON conversation_memory
    FOR UPDATE USING (wallet_address = current_user OR wallet_address = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'));

CREATE POLICY "Users can delete their own conversation memory" ON conversation_memory
    FOR DELETE USING (wallet_address = current_user OR wallet_address = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'));

-- Memory segments policies
CREATE POLICY "Users can view their own memory segments" ON memory_segments
    FOR SELECT USING (wallet_address = current_user OR wallet_address = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'));

CREATE POLICY "Users can insert their own memory segments" ON memory_segments
    FOR INSERT WITH CHECK (wallet_address = current_user OR wallet_address = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'));

CREATE POLICY "Users can update their own memory segments" ON memory_segments
    FOR UPDATE USING (wallet_address = current_user OR wallet_address = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'));

CREATE POLICY "Users can delete their own memory segments" ON memory_segments
    FOR DELETE USING (wallet_address = current_user OR wallet_address = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'));

-- Chat archives policies
CREATE POLICY "Users can view their own chat archives" ON chat_archives
    FOR SELECT USING (wallet_address = current_user OR wallet_address = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'));

CREATE POLICY "Users can insert their own chat archives" ON chat_archives
    FOR INSERT WITH CHECK (wallet_address = current_user OR wallet_address = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'));

CREATE POLICY "Users can update their own chat archives" ON chat_archives
    FOR UPDATE USING (wallet_address = current_user OR wallet_address = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'));

CREATE POLICY "Users can delete their own chat archives" ON chat_archives
    FOR DELETE USING (wallet_address = current_user OR wallet_address = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'));

-- Memory profiles policies
CREATE POLICY "Users can view their own memory profiles" ON memory_profiles
    FOR SELECT USING (wallet_address = current_user OR wallet_address = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'));

CREATE POLICY "Users can insert their own memory profiles" ON memory_profiles
    FOR INSERT WITH CHECK (wallet_address = current_user OR wallet_address = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'));

CREATE POLICY "Users can update their own memory profiles" ON memory_profiles
    FOR UPDATE USING (wallet_address = current_user OR wallet_address = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address'));

CREATE POLICY "Users can delete their own memory profiles" ON memory_profiles
    FOR DELETE USING (wallet_address = current_user OR wallet_address = (current_setting('request.jwt.claims', true)::json ->> 'wallet_address')); 