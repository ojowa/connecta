-- =====================================================
-- SEED: Subscription Plans
-- =====================================================

INSERT INTO payments.plans (name, display_name, description, price_monthly, price_yearly, features, daily_likes, daily_super_likes, sort_order)
VALUES
('free', 'Free', 'Basic features for free', 0, 0,
  '{"unlimited_likes": false, "advanced_filters": false, "see_who_liked": false, "read_receipts": false, "profile_boost": 0, "ai_insights": false, "video_calls": false, "incognito": false}',
  50, 5, 1),
('premium', 'Premium', 'Enhanced dating experience', 4999, 49990,
  '{"unlimited_likes": true, "advanced_filters": true, "see_who_liked": true, "read_receipts": true, "profile_boost": 1, "ai_insights": false, "video_calls": false, "incognito": false}',
  -1, 10, 2),
('gold', 'Gold', 'AI-powered matchmaking', 9999, 99990,
  '{"unlimited_likes": true, "advanced_filters": true, "see_who_liked": true, "read_receipts": true, "profile_boost": 3, "ai_insights": true, "video_calls": false, "incognito": false}',
  -1, 25, 3),
('platinum', 'Platinum', 'Complete dating experience', 14999, 149990,
  '{"unlimited_likes": true, "advanced_filters": true, "see_who_liked": true, "read_receipts": true, "profile_boost": 5, "ai_insights": true, "video_calls": true, "incognito": true}',
  -1, 50, 4);

-- =====================================================
-- SEED: Interest Tags
-- =====================================================

INSERT INTO users.interests (name, category, icon, sort_order) VALUES
('Football', 'Sports', '⚽', 1),
('Basketball', 'Sports', '🏀', 2),
('Tennis', 'Sports', '🎾', 3),
('Swimming', 'Sports', '🏊', 4),
('Running', 'Sports', '🏃', 5),
('Gym', 'Fitness', '💪', 6),
('Yoga', 'Fitness', '🧘', 7),
('Dancing', 'Fitness', '💃', 8),
('Cooking', 'Food', '🍳', 9),
('Street Food', 'Food', '🍔', 10),
('Fine Dining', 'Food', '🍷', 11),
('Baking', 'Food', '🍰', 12),
('Music', 'Entertainment', '🎵', 13),
('Movies', 'Entertainment', '🎬', 14),
('Anime', 'Entertainment', '🎌', 15),
('Podcasts', 'Entertainment', '🎙️', 16),
('Reading', 'Hobbies', '📚', 17),
('Photography', 'Hobbies', '📸', 18),
('Painting', 'Hobbies', '🎨', 19),
('Gaming', 'Hobbies', '🎮', 20),
('Travel', 'Lifestyle', '✈️', 21),
('Hiking', 'Lifestyle', '🏔️', 22),
('Camping', 'Lifestyle', '⛺', 23),
('Beach', 'Lifestyle', '🏖️', 24),
('Fashion', 'Lifestyle', '👗', 25),
('Technology', 'Interests', '💻', 26),
('Science', 'Interests', '🔬', 27),
('History', 'Interests', '🏛️', 28),
('Languages', 'Interests', '🌍', 29),
('Volunteering', 'Values', '🤝', 30),
('Fitness', 'Fitness', '🏋️', 31),
('Cycling', 'Sports', '🚴', 32),
('Karaoke', 'Entertainment', '🎤', 33),
('Art', 'Hobbies', '🖼️', 34),
('Nature', 'Lifestyle', '🌿', 35),
('Dogs', 'Pets', '🐕', 36),
('Cats', 'Pets', '🐱', 37),
('Coffee', 'Lifestyle', '☕', 38),
('Tea', 'Lifestyle', '🍵', 39),
('Netflix', 'Entertainment', '📺', 40);

-- =====================================================
-- SEED: Super Admin User
-- =====================================================

INSERT INTO admin.admin_users (email, password_hash, name, role, is_active)
VALUES ('admin@connecta.app', '$2b$12$LJ3m4ks9hL1NQF9Ws.kJtOKl8hTjNfQGkYvXzR8YbC1dE3fG5hI7', 'Super Admin', 'super_admin', true);
