CREATE TYPE "public"."article_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."media_category" AS ENUM('image', 'video', 'icon', 'document');--> statement-breakpoint
CREATE TYPE "public"."menu_location" AS ENUM('top', 'footer', 'dashboard_sidebar', 'admin_sidebar', 'mobile');--> statement-breakpoint
CREATE TYPE "public"."item_visibility" AS ENUM('public', 'authenticated', 'admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'super_admin', 'manager', 'trader', 'analyst', 'support', 'guest', 'provider', 'instructor');--> statement-breakpoint
CREATE TYPE "public"."plan_type" AS ENUM('membership', 'service');--> statement-breakpoint
CREATE TYPE "public"."plan_interval" AS ENUM('month', 'quarter', 'year', 'lifetime');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'past_due', 'canceled', 'incomplete', 'trialing');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('paid', 'open', 'void', 'uncollectible');--> statement-breakpoint
CREATE TYPE "public"."site_content_type" AS ENUM('hero', 'text', 'cards', 'features', 'faq', 'cta', 'footer', 'settings', 'grid', 'testimonials', 'stats', 'slides');--> statement-breakpoint
CREATE TYPE "public"."content_block_type" AS ENUM('article', 'layout', 'setting', 'media', 'event', 'testimonial');--> statement-breakpoint
CREATE TYPE "public"."signal_action" AS ENUM('BUY', 'SELL');--> statement-breakpoint
CREATE TYPE "public"."signal_timeframe" AS ENUM('1M', '5M', '15M', '30M', '1H', '4H', 'D1', 'W1', 'MN');--> statement-breakpoint
CREATE TYPE "public"."signal_status" AS ENUM('pending', 'open', 'closed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."note_category" AS ENUM('general', 'trading', 'analysis', 'strategy', 'reminder', 'other');--> statement-breakpoint
CREATE TYPE "public"."feature_tier" AS ENUM('FREE', 'BASIC', 'PRO', 'PREMIUM', 'ENTERPRISE', 'INSTITUTIONAL');--> statement-breakpoint
CREATE TYPE "public"."feature_category" AS ENUM('trading', 'analysis', 'mlm', 'platform', 'social');--> statement-breakpoint
CREATE TYPE "public"."certificate_status" AS ENUM('active', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."trading_style" AS ENUM('scalping', 'day_trading', 'swing_trading', 'position_trading', 'mixed');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('conservative', 'moderate', 'aggressive');--> statement-breakpoint
CREATE TYPE "public"."trader_status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."social_category" AS ENUM('Global', 'Asian', 'European', 'Middle East', 'African');--> statement-breakpoint
CREATE TYPE "public"."connection_status" AS ENUM('Disconnected', 'Connected', 'Error');--> statement-breakpoint
CREATE TYPE "public"."service_status" AS ENUM('online', 'offline', 'degraded', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."course_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."course_category" AS ENUM('trading', 'crypto', 'finance', 'mindset', 'security');--> statement-breakpoint
CREATE TYPE "public"."tx_type" AS ENUM('deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'internal_transfer', 'commission', 'bonus', 'fee', 'refund', 'adjustment', 'trade_profit', 'trade_loss', 'copy_trade_fee', 'subscription', 'tokenization_investment', 'tokenization_return', 'staking_deposit', 'staking_withdrawal', 'staking_reward');--> statement-breakpoint
CREATE TYPE "public"."tx_category" AS ENUM('wallet', 'trading', 'mlm', 'subscription', 'tokenization', 'staking', 'other');--> statement-breakpoint
CREATE TYPE "public"."tx_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'reversed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."fee_type" AS ENUM('percentage', 'fixed', 'tiered');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('bank_transfer', 'card', 'crypto', 'paystack', 'flutterwave', 'korapay', 'stripe', 'mobile_money', 'ussd', 'internal', 'manual', 'referral_commission');--> statement-breakpoint
CREATE TYPE "public"."bank_account_type" AS ENUM('savings', 'checking', 'current');--> statement-breakpoint
CREATE TYPE "public"."withdrawal_status" AS ENUM('pending_approval', 'approved', 'processing', 'completed', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."approval_action" AS ENUM('approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."bonus_claim_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."bonus_criteria" AS ENUM('manual', 'first_deposit', 'kyc_approved', 'trade_volume');--> statement-breakpoint
CREATE TYPE "public"."coupon_type" AS ENUM('percentage', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."coupon_category" AS ENUM('subscription', 'shop', 'all');--> statement-breakpoint
CREATE TYPE "public"."module_interval" AS ENUM('month', 'quarter', 'year');--> statement-breakpoint
CREATE TYPE "public"."analysis_type" AS ENUM('technical', 'fundamental', 'sentiment');--> statement-breakpoint
CREATE TYPE "public"."analysis_direction" AS ENUM('bullish', 'bearish', 'neutral');--> statement-breakpoint
CREATE TYPE "public"."bot_strategy" AS ENUM('SENTIMENT_FOLLOWING', 'CONSERVATIVE_CONFIRMATION', 'RETRACEMENT_ENTRY');--> statement-breakpoint
CREATE TYPE "public"."bot_status" AS ENUM('active', 'paused', 'stopped');--> statement-breakpoint
CREATE TYPE "public"."account_status" AS ENUM('connected', 'disconnected', 'invalid_credentials', 'pending', 'error');--> statement-breakpoint
CREATE TYPE "public"."journal_direction" AS ENUM('buy', 'sell', 'long', 'short');--> statement-breakpoint
CREATE TYPE "public"."order_type" AS ENUM('market', 'limit', 'stop', 'stop_limit');--> statement-breakpoint
CREATE TYPE "public"."journal_status" AS ENUM('open', 'closed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."signal_type" AS ENUM('buy', 'sell');--> statement-breakpoint
CREATE TYPE "public"."signal_status2" AS ENUM('active', 'closed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."signal_result" AS ENUM('win', 'loss', 'breakeven', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."impact_level" AS ENUM('High', 'Medium', 'Low');--> statement-breakpoint
CREATE TYPE "public"."copy_trade_status" AS ENUM('pending', 'executed', 'failed', 'closed');--> statement-breakpoint
CREATE TYPE "public"."copy_sub_status" AS ENUM('active', 'paused', 'expired');--> statement-breakpoint
CREATE TYPE "public"."lot_size_strategy" AS ENUM('SIGNAL', 'FIXED', 'MULTIPLIER');--> statement-breakpoint
CREATE TYPE "public"."settlement_status" AS ENUM('none', 'pending', 'paid', 'confirmed', 'overdue');--> statement-breakpoint
CREATE TYPE "public"."commission_type" AS ENUM('binary_match', 'direct_referral', 'matching_bonus', 'leadership_pool', 'rank_advancement', 'fast_start', 'team_bonus', 'car_bonus', 'travel_bonus', 'infinity_bonus', 'global_pool', 'copy_trading', 'signal_provider', 'tokenization', 'staking_rewards', 'adjustment', 'clawback');--> statement-breakpoint
CREATE TYPE "public"."commission_status" AS ENUM('locked', 'pending', 'approved', 'paid', 'held', 'cancelled', 'reversed');--> statement-breakpoint
CREATE TYPE "public"."leg_type" AS ENUM('left', 'right', 'both');--> statement-breakpoint
CREATE TYPE "public"."period_type" AS ENUM('daily', 'weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."tree_position" AS ENUM('left', 'right', 'root');--> statement-breakpoint
CREATE TYPE "public"."placement_pref" AS ENUM('left', 'right', 'weaker_bv', 'weaker_referrals', 'holding_tank');--> statement-breakpoint
CREATE TYPE "public"."qualification_status" AS ENUM('qualified', 'not_qualified', 'grace_period');--> statement-breakpoint
CREATE TYPE "public"."kyc_type" AS ENUM('passport', 'national_id', 'drivers_license', 'residence_permit', 'utility_bill', 'bank_statement', 'selfie', 'selfie_with_id', 'proof_of_address', 'tax_document', 'company_registration', 'other');--> statement-breakpoint
CREATE TYPE "public"."kyc_status" AS ENUM('pending', 'approved', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."aml_check_type" AS ENUM('sanctions', 'pep', 'adverse_media', 'transaction_monitoring', 'enhanced_due_diligence');--> statement-breakpoint
CREATE TYPE "public"."aml_status" AS ENUM('pending', 'clear', 'match', 'potential_match', 'error');--> statement-breakpoint
CREATE TYPE "public"."aml_risk_level" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."aml_action" AS ENUM('none', 'flagged', 'blocked', 'reported');--> statement-breakpoint
CREATE TYPE "public"."ticket_category" AS ENUM('general', 'account', 'deposit', 'withdrawal', 'trading', 'mlm', 'kyc', 'technical', 'billing', 'other');--> statement-breakpoint
CREATE TYPE "public"."ticket_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'in_progress', 'waiting_customer', 'waiting_internal', 'resolved', 'closed', 'liquidated');--> statement-breakpoint
CREATE TYPE "public"."sender_type" AS ENUM('user', 'agent', 'system');--> statement-breakpoint
CREATE TYPE "public"."config_category" AS ENUM('general', 'fees', 'limits', 'mlm', 'trading', 'security', 'notifications', 'integrations', 'broadcast', 'financial');--> statement-breakpoint
CREATE TYPE "public"."health_status" AS ENUM('healthy', 'degraded', 'critical');--> statement-breakpoint
CREATE TYPE "public"."annealing_type" AS ENUM('integrity', 'performance', 'security', 'cleanup');--> statement-breakpoint
CREATE TYPE "public"."annealing_status" AS ENUM('success', 'warning', 'error');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('system', 'transaction', 'trading', 'mlm', 'security', 'kyc', 'promotion', 'announcement', 'copy_trading', 'tokenization');--> statement-breakpoint
CREATE TYPE "public"."notification_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."newsletter_status" AS ENUM('active', 'unsubscribed');--> statement-breakpoint
CREATE TYPE "public"."email_category" AS ENUM('auth', 'transactional', 'marketing', 'security', 'kyc', 'support', 'system');--> statement-breakpoint
CREATE TYPE "public"."activity_category" AS ENUM('auth', 'profile', 'wallet', 'trading', 'mlm', 'kyc', 'admin', 'system');--> statement-breakpoint
CREATE TYPE "public"."activity_status" AS ENUM('success', 'failure', 'warning');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('real_estate', 'commodity', 'startup', 'art', 'other');--> statement-breakpoint
CREATE TYPE "public"."pool_status" AS ENUM('upcoming', 'open', 'closed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."investment_pool_status" AS ENUM('draft', 'funding', 'active', 'closed', 'liquidating');--> statement-breakpoint
CREATE TYPE "public"."pool_category" AS ENUM('forex', 'crypto', 'stocks', 'commodities', 'real_estate', 'mixed');--> statement-breakpoint
CREATE TYPE "public"."pool_risk_level" AS ENUM('low', 'medium', 'high', 'extreme');--> statement-breakpoint
CREATE TYPE "public"."investment_status" AS ENUM('active', 'withdrawn', 'locked');--> statement-breakpoint
CREATE TYPE "public"."investment_status2" AS ENUM('active', 'sold', 'transferred', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."news_category" AS ENUM('crypto', 'forex', 'stocks', 'economy', 'general');--> statement-breakpoint
CREATE TABLE "help_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text DEFAULT 'HelpCircle',
	"order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "help_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "help_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text NOT NULL,
	"category_id" uuid NOT NULL,
	"status" "article_status" DEFAULT 'draft',
	"order" integer DEFAULT 0,
	"view_count" integer DEFAULT 0,
	"tags" text[] DEFAULT '{}',
	"search_vector" "tsvector",
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "help_articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" text NOT NULL,
	"originalname" text NOT NULL,
	"mimetype" text NOT NULL,
	"size" integer NOT NULL,
	"path" text NOT NULL,
	"url" text NOT NULL,
	"category" "media_category" DEFAULT 'image',
	"alt" text,
	"dimensions" jsonb DEFAULT '{}'::jsonb,
	"duration" numeric(10, 2),
	"uploaded_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "menus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"location" "menu_location" NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "menus_name_unique" UNIQUE("name"),
	CONSTRAINT "menus_location_unique" UNIQUE("location")
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"seo" jsonb DEFAULT '{}'::jsonb,
	"layout" text DEFAULT 'default',
	"content" uuid[] DEFAULT '{}',
	"published" boolean DEFAULT false,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"username" text,
	"password" text NOT NULL,
	"role" "user_role" DEFAULT 'user',
	"is_provider" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"email_verified" boolean DEFAULT false,
	"last_login" timestamp with time zone,
	"profile" jsonb DEFAULT '{"firstName":null,"lastName":null,"phone":null,"avatar":null,"timezone":"UTC","country":null}'::jsonb,
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"referral_code" text,
	"reset_password_token" text,
	"reset_password_expire" timestamp with time zone,
	"tier_id" uuid,
	"locked_wallet_balance" numeric(20, 4) DEFAULT 0,
	"membership_tier" text DEFAULT 'Basic',
	"active_services" text[] DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"type" "plan_type" DEFAULT 'service',
	"allowed_services" text[] DEFAULT '{}',
	"interval" "plan_interval" DEFAULT 'lifetime',
	"description" text DEFAULT '',
	"features" jsonb DEFAULT '{}'::jsonb,
	"limits" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"allowed_menus" text[] DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "plans_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"service_key" text,
	"type" "plan_type" DEFAULT 'service',
	"status" "subscription_status" DEFAULT 'incomplete',
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"subscription_id" uuid,
	"amount" numeric(20, 4) NOT NULL,
	"currency" text DEFAULT 'USD',
	"status" "invoice_status" DEFAULT 'open',
	"stripe_invoice_id" text,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "site_contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"page" text NOT NULL,
	"section" text NOT NULL,
	"type" "site_content_type" DEFAULT 'text',
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "site_contents_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "content_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"type" "content_block_type" DEFAULT 'article',
	"title" text NOT NULL,
	"content" text DEFAULT '',
	"data" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"author_id" uuid,
	"tags" text[] DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "content_blocks_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "social_signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trader_id" uuid NOT NULL,
	"trader_name" text NOT NULL,
	"symbol" text NOT NULL,
	"action" "signal_action" NOT NULL,
	"entry_price" numeric(20, 8) NOT NULL,
	"stop_loss" numeric(20, 8) NOT NULL,
	"take_profit" numeric(20, 8) NOT NULL,
	"lot_size" numeric(10, 4) DEFAULT 0.01,
	"timeframe" "signal_timeframe" DEFAULT 'D1',
	"strategy" text,
	"confidence" integer DEFAULT 50,
	"risk_reward_ratio" numeric(10, 4) DEFAULT 0,
	"notes" text,
	"status" "signal_status" DEFAULT 'pending',
	"open_time" timestamp with time zone DEFAULT now(),
	"close_time" timestamp with time zone,
	"close_price" numeric(20, 8),
	"profit" numeric(20, 4) DEFAULT 0,
	"profit_percentage" numeric(10, 4) DEFAULT 0,
	"views" integer DEFAULT 0,
	"copies" integer DEFAULT 0,
	"likes" integer DEFAULT 0,
	"comments" jsonb DEFAULT '[]'::jsonb,
	"tags" text[] DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_gateways" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"is_active" boolean DEFAULT false,
	"config" jsonb DEFAULT '{}'::jsonb,
	"supported_methods" text[] DEFAULT '{}',
	"description" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "payment_gateways_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" "note_category" DEFAULT 'general',
	"is_pinned" boolean DEFAULT false,
	"tags" text[] DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"enabled" boolean DEFAULT false,
	"required_tier" "feature_tier" DEFAULT 'PRO',
	"category" "feature_category" DEFAULT 'platform',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "feature_flags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "menu_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	"price" numeric(10, 2) DEFAULT 0,
	"currency" text DEFAULT 'USD',
	"description" text,
	"is_active" boolean DEFAULT true,
	"attributes" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "menu_configs_label_unique" UNIQUE("label")
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"course_name" text NOT NULL,
	"code" text,
	"issue_date" timestamp with time zone DEFAULT now(),
	"expiry_date" timestamp with time zone,
	"status" "certificate_status" DEFAULT 'active',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "certificates_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "social_tradings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"avatar" text DEFAULT '/assets/default-avatar.png',
	"bio" text,
	"total_trades" integer DEFAULT 0,
	"winning_trades" integer DEFAULT 0,
	"losing_trades" integer DEFAULT 0,
	"win_rate" numeric(5, 2) DEFAULT 0,
	"profit_factor" numeric(10, 4) DEFAULT 0,
	"average_return" numeric(10, 4) DEFAULT 0,
	"max_drawdown" numeric(10, 4) DEFAULT 0,
	"sharpe_ratio" numeric(10, 4) DEFAULT 0,
	"total_profit" numeric(20, 4) DEFAULT 0,
	"total_loss" numeric(20, 4) DEFAULT 0,
	"net_profit" numeric(20, 4) DEFAULT 0,
	"best_trade" numeric(20, 4) DEFAULT 0,
	"worst_trade" numeric(20, 4) DEFAULT 0,
	"average_trade_size" numeric(20, 4) DEFAULT 0,
	"followers" integer DEFAULT 0,
	"following" integer DEFAULT 0,
	"copiers" integer DEFAULT 0,
	"reputation" integer DEFAULT 0,
	"verified" boolean DEFAULT false,
	"is_provider" boolean DEFAULT false,
	"subscription_fee" numeric(10, 2) DEFAULT 0,
	"free_trial_days" integer DEFAULT 0,
	"trading_style" "trading_style",
	"preferred_markets" text[] DEFAULT '{}',
	"risk_level" "risk_level" DEFAULT 'moderate',
	"last_trade_date" timestamp with time zone,
	"last_signal_date" timestamp with time zone,
	"member_since" timestamp with time zone DEFAULT now(),
	"status" "trader_status" DEFAULT 'active',
	"monthly_returns" jsonb DEFAULT '[]'::jsonb,
	"social_handles" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "social_tradings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "social_handles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" text NOT NULL,
	"handle" text NOT NULL,
	"url" text NOT NULL,
	"category" "social_category" NOT NULL,
	"icon" text DEFAULT 'ExternalLink',
	"color" text DEFAULT '#amber-500',
	"description" text,
	"order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"connection_status" "connection_status" DEFAULT 'Disconnected',
	"api_credentials" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "social_follows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_id" uuid NOT NULL,
	"trader_id" uuid NOT NULL,
	"is_copying" boolean DEFAULT false,
	"followed_at" timestamp with time zone DEFAULT now(),
	"copy_started_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"api_key" text DEFAULT '',
	"health_endpoint" text DEFAULT '/health',
	"status" "service_status" DEFAULT 'offline',
	"is_active" boolean DEFAULT true,
	"last_health_check" timestamp with time zone,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "system_services_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text,
	"description" text NOT NULL,
	"thumbnail" text,
	"instructor_id" uuid,
	"level" "course_level" DEFAULT 'beginner',
	"category" "course_category" DEFAULT 'trading',
	"price" numeric(10, 2) DEFAULT 0,
	"currency" text DEFAULT 'USD',
	"is_published" boolean DEFAULT false,
	"allowed_plans" uuid[] DEFAULT '{}',
	"tags" text[] DEFAULT '{}',
	"total_duration" integer DEFAULT 0,
	"enrolled_count" integer DEFAULT 0,
	"rating" numeric(3, 2) DEFAULT 0,
	"rating_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "course_modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"video_url" text,
	"pdf_url" text,
	"duration" integer,
	"is_free" boolean DEFAULT false,
	"order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_progresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now(),
	"completed_lessons" uuid[] DEFAULT '{}',
	"completed_modules" uuid[] DEFAULT '{}',
	"progress_percent" integer DEFAULT 0,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp with time zone,
	"certificate_url" text,
	"last_accessed_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"balances" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"settings" jsonb DEFAULT '{"defaultCurrency":"USD","autoConvert":false}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "wallets_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "tx_type" NOT NULL,
	"category" "tx_category" DEFAULT 'wallet',
	"status" "tx_status" DEFAULT 'pending',
	"amount" numeric(20, 4) NOT NULL,
	"currency" text NOT NULL,
	"amount_usd" numeric(20, 4),
	"exchange_rate" numeric(20, 8),
	"fee" numeric(20, 4) DEFAULT 0,
	"fee_type" "fee_type",
	"fee_currency" text,
	"net_amount" numeric(20, 4),
	"payment_method" "payment_method",
	"payment_provider" text,
	"payment_details" jsonb,
	"crypto" jsonb,
	"bank" jsonb,
	"reference" text,
	"external_reference" text,
	"related_user_id" uuid,
	"related_transaction_id" uuid,
	"mlm_commission_id" uuid,
	"balance_before" numeric(20, 4),
	"balance_after" numeric(20, 4),
	"description" text,
	"notes" text,
	"metadata" jsonb,
	"processed_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "transactions_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"level" integer DEFAULT 0 NOT NULL,
	"price" numeric(10, 2) DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'USD',
	"features" jsonb DEFAULT '{}'::jsonb,
	"accessible_modules" text[] DEFAULT '{}',
	"commissions" jsonb DEFAULT '{"directReferralPercent":5,"binaryMatchPercent":5}'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "tiers_code_unique" UNIQUE("code"),
	CONSTRAINT "tiers_level_unique" UNIQUE("level")
);
--> statement-breakpoint
CREATE TABLE "crypto_wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"chain" text NOT NULL,
	"address" text NOT NULL,
	"private_key_encrypted" text,
	"derivation_path" text,
	"wallet_index" integer,
	"label" text,
	"is_active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "crypto_wallets_address_unique" UNIQUE("address")
);
--> statement-breakpoint
CREATE TABLE "saved_bank_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_name" text NOT NULL,
	"account_number" text NOT NULL,
	"bank_name" text NOT NULL,
	"bank_code" text NOT NULL,
	"country" text NOT NULL,
	"currency" text NOT NULL,
	"account_type" "bank_account_type" DEFAULT 'savings',
	"routing_number" text,
	"swift_code" text,
	"iban" text,
	"is_verified" boolean DEFAULT false,
	"is_primary" boolean DEFAULT false,
	"label" text,
	"recipient_code" text,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pending_withdrawals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" numeric(20, 4) NOT NULL,
	"currency" text NOT NULL,
	"fee" numeric(20, 4) DEFAULT 0,
	"net_amount" numeric(20, 4),
	"payment_method" text NOT NULL,
	"destination" jsonb NOT NULL,
	"status" "withdrawal_status" DEFAULT 'pending_approval',
	"requires_approval" boolean DEFAULT false,
	"approval_level" integer DEFAULT 1,
	"approvals" jsonb DEFAULT '[]'::jsonb,
	"two_factor_verified" boolean DEFAULT false,
	"email_verified" boolean DEFAULT false,
	"verification_code" text,
	"verification_expires" timestamp with time zone,
	"transaction_id" uuid,
	"notes" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bonus_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"reward_amount" numeric(20, 4) NOT NULL,
	"reward_currency" text DEFAULT 'USD',
	"criteria" "bonus_criteria" DEFAULT 'manual',
	"is_active" boolean DEFAULT true,
	"expiry_date" timestamp with time zone,
	"max_claims" integer DEFAULT 0,
	"current_claims" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bonus_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bonus_activity_id" uuid NOT NULL,
	"status" "bonus_claim_status" DEFAULT 'pending',
	"claim_proof" text DEFAULT '',
	"processed_at" timestamp with time zone,
	"processed_by" uuid,
	"rejection_reason" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"discount_type" "coupon_type" DEFAULT 'percentage',
	"discount_value" numeric(10, 4) NOT NULL,
	"min_purchase_amount" numeric(20, 4) DEFAULT 0,
	"max_discount_amount" numeric(20, 4),
	"expiry_date" timestamp with time zone,
	"usage_limit" integer DEFAULT 1,
	"usage_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"category" "coupon_category" DEFAULT 'all',
	"description" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"billing_interval" "module_interval" DEFAULT 'month',
	"base_price" numeric(10, 2) DEFAULT 50 NOT NULL,
	"currency" text DEFAULT 'USD',
	"tier_overrides" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "modules_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"title" text NOT NULL,
	"pair" text NOT NULL,
	"type" "analysis_type" DEFAULT 'technical',
	"content" text NOT NULL,
	"chart_url" text,
	"prediction" jsonb DEFAULT '{}'::jsonb,
	"is_premium" boolean DEFAULT false,
	"tags" text[] DEFAULT '{}',
	"view_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trading_bots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"pair" text NOT NULL,
	"strategy" "bot_strategy" DEFAULT 'SENTIMENT_FOLLOWING',
	"allocation" numeric(20, 4) NOT NULL,
	"status" "bot_status" DEFAULT 'paused',
	"settings" jsonb DEFAULT '{"stopLossPips":30,"takeProfitPips":60,"maxConcurrentTrades":1,"riskPerTrade":1,"maxDailyLoss":100,"trailingStop":false}'::jsonb,
	"stats" jsonb DEFAULT '{"totalTrades":0,"winRate":0,"netProfit":0}'::jsonb,
	"last_executed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trading_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"account_name" text,
	"account_number" text NOT NULL,
	"password_encrypted" text,
	"api_key_encrypted" text,
	"api_secret_encrypted" text,
	"server" text,
	"broker" text,
	"status" "account_status" DEFAULT 'pending',
	"last_sync" timestamp with time zone,
	"balance" numeric(20, 4) DEFAULT 0,
	"equity" numeric(20, 4) DEFAULT 0,
	"currency" text DEFAULT 'USD',
	"is_public" boolean DEFAULT false,
	"is_provider" boolean DEFAULT false,
	"provider_profile" jsonb DEFAULT '{}'::jsonb,
	"stats" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trade_journals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"trading_account" jsonb DEFAULT '{}'::jsonb,
	"symbol" text NOT NULL,
	"direction" "journal_direction" NOT NULL,
	"order_type" "order_type" DEFAULT 'market',
	"lot_size" numeric(10, 4),
	"units" integer,
	"leverage" numeric(10, 2),
	"entry_price" numeric(20, 8) NOT NULL,
	"exit_price" numeric(20, 8),
	"stop_loss" numeric(20, 8),
	"take_profit" numeric(20, 8),
	"profit_loss" numeric(20, 4),
	"profit_loss_pips" numeric(10, 2),
	"profit_loss_percent" numeric(10, 4),
	"commission" numeric(20, 4) DEFAULT 0,
	"swap" numeric(20, 4) DEFAULT 0,
	"net_profit_loss" numeric(20, 4),
	"status" "journal_status" DEFAULT 'open',
	"setup" text,
	"strategy" text,
	"timeframe" text,
	"notes" text,
	"tags" text[] DEFAULT '{}',
	"emotions" jsonb DEFAULT '{}'::jsonb,
	"rating" integer,
	"screenshots" jsonb DEFAULT '[]'::jsonb,
	"entry_time" timestamp with time zone NOT NULL,
	"exit_time" timestamp with time zone,
	"duration" integer,
	"external_trade_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trading_signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"pair" text NOT NULL,
	"type" "signal_type" NOT NULL,
	"entry_price" numeric(20, 8) NOT NULL,
	"stop_loss" numeric(20, 8) NOT NULL,
	"take_profit" numeric(20, 8)[],
	"status" "signal_status2" DEFAULT 'active',
	"result" "signal_result" DEFAULT 'unknown',
	"pips" numeric(10, 2),
	"analysis" text,
	"timeframe" text,
	"is_premium" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fundamental_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country" text NOT NULL,
	"indicator" text NOT NULL,
	"value" text NOT NULL,
	"previous_value" text,
	"forecast_value" text,
	"impact" "impact_level" DEFAULT 'Medium',
	"release_date" timestamp with time zone NOT NULL,
	"period" text,
	"unit" text,
	"source" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cot_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset" text NOT NULL,
	"reporting_date" timestamp with time zone NOT NULL,
	"non_commercial_long" numeric(20, 4),
	"non_commercial_short" numeric(20, 4),
	"commercial_long" numeric(20, 4),
	"commercial_short" numeric(20, 4),
	"speculator_long" numeric(20, 4),
	"speculator_short" numeric(20, 4),
	"open_interest" numeric(20, 4),
	"net_position" numeric(20, 4) NOT NULL,
	"sentiment_score" numeric(5, 2),
	"source" text DEFAULT 'CFTC',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copy_trades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_id" uuid NOT NULL,
	"provider_id" uuid NOT NULL,
	"provider_trade_id" uuid,
	"follower_trade_id" uuid,
	"allocation" numeric(20, 4),
	"risk_multiplier" numeric(10, 4) DEFAULT 1,
	"max_lot_size" numeric(10, 4),
	"symbol" text,
	"direction" "journal_direction",
	"provider_lot_size" numeric(10, 4),
	"copied_lot_size" numeric(10, 4),
	"provider_entry_price" numeric(20, 8),
	"follower_entry_price" numeric(20, 8),
	"slippage" numeric(20, 8),
	"provider_profit_loss" numeric(20, 4),
	"follower_profit_loss" numeric(20, 4),
	"status" "copy_trade_status" DEFAULT 'pending',
	"failure_reason" text,
	"copy_fee" numeric(20, 4),
	"provider_share" numeric(20, 4),
	"platform_share" numeric(20, 4),
	"executed_at" timestamp with time zone DEFAULT now(),
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copy_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_id" uuid NOT NULL,
	"provider_id" uuid NOT NULL,
	"status" "copy_sub_status" DEFAULT 'active',
	"allocation_amount" numeric(20, 4) NOT NULL,
	"risk_multiplier" numeric(10, 4) DEFAULT 1,
	"lot_size_strategy" "lot_size_strategy" DEFAULT 'SIGNAL',
	"lot_size_value" numeric(10, 4) DEFAULT 0.01,
	"min_lot_size" numeric(10, 4) DEFAULT 0,
	"max_drawdown" numeric(10, 2) DEFAULT 20,
	"accrued_pnl" numeric(20, 4) DEFAULT 0,
	"pending_commission" numeric(20, 4) DEFAULT 0,
	"settlement_status" "settlement_status" DEFAULT 'none',
	"settlement_deadline" timestamp with time zone,
	"last_settlement_at" timestamp with time zone,
	"is_suspended" boolean DEFAULT false,
	"suspension_reason" text,
	"max_positions" integer DEFAULT 5,
	"allowed_symbols" text[] DEFAULT '{}',
	"excluded_symbols" text[] DEFAULT '{}',
	"follower_account_id" uuid NOT NULL,
	"is_c_book" boolean DEFAULT false,
	"total_profit" numeric(20, 4) DEFAULT 0,
	"equity_at_start" numeric(20, 4),
	"subscribed_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mlm_ranks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"level" integer NOT NULL,
	"requirements" jsonb DEFAULT '{}'::jsonb,
	"benefits" jsonb DEFAULT '{}'::jsonb,
	"badge" text,
	"color" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "mlm_ranks_name_unique" UNIQUE("name"),
	CONSTRAINT "mlm_ranks_level_unique" UNIQUE("level")
);
--> statement-breakpoint
CREATE TABLE "mlm_commissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "commission_type" NOT NULL,
	"amount" numeric(20, 4) NOT NULL,
	"currency" text DEFAULT 'USD',
	"status" "commission_status" DEFAULT 'pending',
	"unlocks_at_tier_level" integer,
	"is_used_for_upgrade" boolean DEFAULT false,
	"source_user_id" uuid,
	"source_transaction_id" uuid,
	"generation" integer,
	"leg" "leg_type",
	"volume_left" numeric(20, 4),
	"volume_right" numeric(20, 4),
	"volume_matched" numeric(20, 4),
	"carry_forward" numeric(20, 4),
	"rank" text,
	"period_type" "period_type",
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"description" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"paid_at" timestamp with time zone,
	"paid_transaction_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mlm_tree_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"sponsor_id" uuid,
	"parent_id" uuid,
	"position" "tree_position",
	"left_child_id" uuid,
	"right_child_id" uuid,
	"depth" integer DEFAULT 0,
	"path" "ltree",
	"ancestors" uuid[] DEFAULT '{}',
	"left_descendant_count" integer DEFAULT 0,
	"right_descendant_count" integer DEFAULT 0,
	"left_leg_volume" numeric(20, 4) DEFAULT 0,
	"right_leg_volume" numeric(20, 4) DEFAULT 0,
	"left_leg_volume_this_period" numeric(20, 4) DEFAULT 0,
	"right_leg_volume_this_period" numeric(20, 4) DEFAULT 0,
	"personal_volume" numeric(20, 4) DEFAULT 0,
	"personal_volume_this_period" numeric(20, 4) DEFAULT 0,
	"group_volume" numeric(20, 4) DEFAULT 0,
	"rank" text DEFAULT 'Starter',
	"is_active" boolean DEFAULT true,
	"preferred_placement" "placement_pref" DEFAULT 'left',
	"qualification_status" "qualification_status" DEFAULT 'not_qualified',
	"last_activity_date" timestamp with time zone,
	"join_date" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "mlm_tree_nodes_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "mlm_volume_histories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"period_type" "period_type" NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"personal_volume" numeric(20, 4) DEFAULT 0,
	"left_leg_volume" numeric(20, 4) DEFAULT 0,
	"right_leg_volume" numeric(20, 4) DEFAULT 0,
	"group_volume" numeric(20, 4) DEFAULT 0,
	"carry_forward_left" numeric(20, 4) DEFAULT 0,
	"carry_forward_right" numeric(20, 4) DEFAULT 0,
	"volume_matched" numeric(20, 4) DEFAULT 0,
	"commissions_earned" numeric(20, 4) DEFAULT 0,
	"rank" text,
	"direct_referrals" integer DEFAULT 0,
	"active_directs" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mlm_rank_histories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"previous_rank" text,
	"new_rank" text NOT NULL,
	"achieved_at" timestamp with time zone DEFAULT now(),
	"qualification_snapshot" jsonb DEFAULT '{}'::jsonb,
	"bonus_awarded" numeric(20, 4) DEFAULT 0,
	"bonus_transaction_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kyc_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "kyc_type" NOT NULL,
	"document_number" text,
	"issuing_country" text,
	"issued_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"file_url" text NOT NULL,
	"file_name" text,
	"file_size" integer,
	"mime_type" text,
	"status" "kyc_status" DEFAULT 'pending',
	"verified_by_id" uuid,
	"verified_at" timestamp with time zone,
	"rejection_reason" text,
	"extracted_data" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "aml_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"transaction_id" uuid,
	"check_type" "aml_check_type" NOT NULL,
	"provider" text,
	"reference" text,
	"status" "aml_status" DEFAULT 'pending',
	"risk_score" integer,
	"risk_level" "aml_risk_level",
	"matches" jsonb DEFAULT '[]'::jsonb,
	"result" jsonb DEFAULT '{}'::jsonb,
	"review_required" boolean DEFAULT false,
	"reviewed_by_id" uuid,
	"reviewed_at" timestamp with time zone,
	"review_notes" text,
	"action" "aml_action" DEFAULT 'none',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ticket_number" text,
	"subject" text NOT NULL,
	"category" "ticket_category" DEFAULT 'general',
	"priority" "ticket_priority" DEFAULT 'normal',
	"status" "ticket_status" DEFAULT 'open',
	"messages" jsonb DEFAULT '[]'::jsonb,
	"internal_notes" jsonb DEFAULT '[]'::jsonb,
	"assigned_to_id" uuid,
	"related_transaction_id" uuid,
	"tags" text[] DEFAULT '{}',
	"rating" jsonb DEFAULT '{}'::jsonb,
	"first_response_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "support_tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "system_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" jsonb DEFAULT '{}'::jsonb,
	"category" "config_category" DEFAULT 'general',
	"description" text,
	"is_public" boolean DEFAULT false,
	"last_modified_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "system_configs_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "site_statuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_maintenance_mode" boolean DEFAULT false,
	"maintenance_message" text DEFAULT 'We are currently performing scheduled maintenance. Please check back shortly.',
	"version" text DEFAULT '2.0.0',
	"last_build" timestamp with time zone,
	"health" jsonb DEFAULT '{"status":"healthy","lastChecked":null}'::jsonb,
	"annealing_reports" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb,
	"priority" "notification_priority" DEFAULT 'normal',
	"channels" jsonb DEFAULT '{"inApp":true,"email":false,"push":false,"sms":false}'::jsonb,
	"status" jsonb DEFAULT '{"inAppSent":true,"emailSent":false,"pushSent":false,"smsSent":false}'::jsonb,
	"read" boolean DEFAULT false,
	"read_at" timestamp with time zone,
	"action_url" text,
	"action_text" text,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "newsletters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"status" "newsletter_status" DEFAULT 'active',
	"subscribed_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "newsletters_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"category" "email_category" NOT NULL,
	"description" text,
	"subject" text NOT NULL,
	"html_body" text NOT NULL,
	"variables" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"last_modified_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "email_templates_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "email_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text DEFAULT 'email_preferences',
	"admin_recipients" text[] DEFAULT '{}',
	"admin_notifications" jsonb DEFAULT '{}'::jsonb,
	"user_default_notifications" jsonb DEFAULT '{"auth":true,"finance":true,"kyc":true,"subscription":true,"trading":true,"support":true,"system":true,"marketing":false}'::jsonb,
	"last_modified_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "email_preferences_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"category" "activity_category" DEFAULT 'system',
	"description" text,
	"details" jsonb DEFAULT '{}'::jsonb,
	"target_type" text,
	"target_id" uuid,
	"ip_address" text,
	"user_agent" text,
	"device" jsonb DEFAULT '{}'::jsonb,
	"location" jsonb DEFAULT '{}'::jsonb,
	"status" "activity_status" DEFAULT 'success',
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "token_pools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"asset_type" "asset_type" NOT NULL,
	"total_token_supply" numeric(20, 4) NOT NULL,
	"token_price" numeric(20, 8) NOT NULL,
	"min_investment" numeric(20, 4) DEFAULT 1,
	"max_investment" numeric(20, 4),
	"tokens_sold" numeric(20, 4) DEFAULT 0,
	"status" "pool_status" DEFAULT 'upcoming',
	"expected_return" text,
	"duration" text,
	"images" text[] DEFAULT '{}',
	"documents" text[] DEFAULT '{}',
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "investment_pools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"description" text,
	"category" "pool_category",
	"manager_id" uuid,
	"status" "investment_pool_status" DEFAULT 'draft',
	"target_size" numeric(20, 4),
	"current_size" numeric(20, 4) DEFAULT 0,
	"min_investment" numeric(20, 4) DEFAULT 100,
	"max_investment" numeric(20, 4),
	"currency" text DEFAULT 'USD',
	"token_price" numeric(20, 8) DEFAULT 1,
	"tokens_available" numeric(20, 4),
	"tokens_sold" numeric(20, 4) DEFAULT 0,
	"expected_return" numeric(10, 4),
	"actual_return" numeric(10, 4) DEFAULT 0,
	"risk_level" "pool_risk_level",
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"lockup_period" integer,
	"assets" jsonb DEFAULT '[]'::jsonb,
	"documents" jsonb DEFAULT '[]'::jsonb,
	"features" text[] DEFAULT '{}',
	"is_featured" boolean DEFAULT false,
	"allow_new_investments" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "investment_pools_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "pool_investments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"pool_id" uuid NOT NULL,
	"amount" numeric(20, 4) NOT NULL,
	"currency" text DEFAULT 'USD',
	"tokens_owned" numeric(20, 4) NOT NULL,
	"token_price_at_purchase" numeric(20, 8),
	"current_value" numeric(20, 4),
	"profit" numeric(20, 4) DEFAULT 0,
	"profit_percentage" numeric(10, 4) DEFAULT 0,
	"status" "investment_status" DEFAULT 'active',
	"lockup_end_date" timestamp with time zone,
	"auto_compound" boolean DEFAULT false,
	"dividends_earned" numeric(20, 4) DEFAULT 0,
	"transaction_id" uuid,
	"invested_at" timestamp with time zone DEFAULT now(),
	"withdrawn_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "investments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"pool_id" uuid NOT NULL,
	"tokens_purchased" numeric(20, 4) NOT NULL,
	"amount_invested" numeric(20, 4) NOT NULL,
	"status" "investment_status2" DEFAULT 'active',
	"transaction_reference" text,
	"dividends_earned" numeric(20, 4) DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "news_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text,
	"content" text NOT NULL,
	"summary" text,
	"thumbnail" text,
	"category" "news_category" DEFAULT 'general',
	"source" jsonb DEFAULT '{}'::jsonb,
	"author_id" uuid,
	"is_published" boolean DEFAULT false,
	"published_at" timestamp with time zone,
	"tags" text[] DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "news_articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "help_articles" ADD CONSTRAINT "help_articles_category_id_help_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."help_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_signals" ADD CONSTRAINT "social_signals_trader_id_users_id_fk" FOREIGN KEY ("trader_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_tradings" ADD CONSTRAINT "social_tradings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_follows" ADD CONSTRAINT "social_follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_follows" ADD CONSTRAINT "social_follows_trader_id_users_id_fk" FOREIGN KEY ("trader_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_lessons" ADD CONSTRAINT "course_lessons_module_id_course_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_progresses" ADD CONSTRAINT "course_progresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_progresses" ADD CONSTRAINT "course_progresses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_related_user_id_users_id_fk" FOREIGN KEY ("related_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crypto_wallets" ADD CONSTRAINT "crypto_wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_bank_accounts" ADD CONSTRAINT "saved_bank_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_withdrawals" ADD CONSTRAINT "pending_withdrawals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bonus_claims" ADD CONSTRAINT "bonus_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bonus_claims" ADD CONSTRAINT "bonus_claims_bonus_activity_id_bonus_activities_id_fk" FOREIGN KEY ("bonus_activity_id") REFERENCES "public"."bonus_activities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bonus_claims" ADD CONSTRAINT "bonus_claims_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_bots" ADD CONSTRAINT "trading_bots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_accounts" ADD CONSTRAINT "trading_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_journals" ADD CONSTRAINT "trade_journals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_signals" ADD CONSTRAINT "trading_signals_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copy_trades" ADD CONSTRAINT "copy_trades_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copy_trades" ADD CONSTRAINT "copy_trades_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copy_subscriptions" ADD CONSTRAINT "copy_subscriptions_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copy_subscriptions" ADD CONSTRAINT "copy_subscriptions_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copy_subscriptions" ADD CONSTRAINT "copy_subscriptions_follower_account_id_trading_accounts_id_fk" FOREIGN KEY ("follower_account_id") REFERENCES "public"."trading_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mlm_commissions" ADD CONSTRAINT "mlm_commissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mlm_commissions" ADD CONSTRAINT "mlm_commissions_source_user_id_users_id_fk" FOREIGN KEY ("source_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mlm_commissions" ADD CONSTRAINT "mlm_commissions_source_transaction_id_transactions_id_fk" FOREIGN KEY ("source_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mlm_commissions" ADD CONSTRAINT "mlm_commissions_paid_transaction_id_transactions_id_fk" FOREIGN KEY ("paid_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mlm_tree_nodes" ADD CONSTRAINT "mlm_tree_nodes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mlm_tree_nodes" ADD CONSTRAINT "mlm_tree_nodes_sponsor_id_users_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mlm_tree_nodes" ADD CONSTRAINT "mlm_tree_nodes_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mlm_tree_nodes" ADD CONSTRAINT "mlm_tree_nodes_left_child_id_users_id_fk" FOREIGN KEY ("left_child_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mlm_tree_nodes" ADD CONSTRAINT "mlm_tree_nodes_right_child_id_users_id_fk" FOREIGN KEY ("right_child_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mlm_volume_histories" ADD CONSTRAINT "mlm_volume_histories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mlm_rank_histories" ADD CONSTRAINT "mlm_rank_histories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_verified_by_id_users_id_fk" FOREIGN KEY ("verified_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aml_checks" ADD CONSTRAINT "aml_checks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aml_checks" ADD CONSTRAINT "aml_checks_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aml_checks" ADD CONSTRAINT "aml_checks_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_related_transaction_id_transactions_id_fk" FOREIGN KEY ("related_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_configs" ADD CONSTRAINT "system_configs_last_modified_by_id_users_id_fk" FOREIGN KEY ("last_modified_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_last_modified_by_id_users_id_fk" FOREIGN KEY ("last_modified_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_preferences" ADD CONSTRAINT "email_preferences_last_modified_by_id_users_id_fk" FOREIGN KEY ("last_modified_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_pools" ADD CONSTRAINT "investment_pools_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pool_investments" ADD CONSTRAINT "pool_investments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pool_investments" ADD CONSTRAINT "pool_investments_pool_id_investment_pools_id_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."investment_pools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pool_investments" ADD CONSTRAINT "pool_investments_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investments" ADD CONSTRAINT "investments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investments" ADD CONSTRAINT "investments_pool_id_token_pools_id_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."token_pools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_help_articles_search" ON "help_articles" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "idx_help_articles_category" ON "help_articles" USING btree ("category_id","status");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_users_is_active" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_users_email_verified" ON "users" USING btree ("email_verified");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_referral_code" ON "users" USING btree ("referral_code") WHERE "users"."referral_code" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_subscriptions_user" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_plan" ON "subscriptions" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_user" ON "invoices" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_site_contents_page_order" ON "site_contents" USING btree ("page","sort_order");--> statement-breakpoint
CREATE INDEX "idx_social_signals_trader" ON "social_signals" USING btree ("trader_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_social_signals_status" ON "social_signals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_social_signals_symbol" ON "social_signals" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "idx_social_signals_created" ON "social_signals" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_notes_user_created" ON "notes" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_notes_user_pinned" ON "notes" USING btree ("user_id","is_pinned","created_at");--> statement-breakpoint
CREATE INDEX "idx_certificates_recipient" ON "certificates" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "idx_social_tradings_winrate" ON "social_tradings" USING btree ("win_rate");--> statement-breakpoint
CREATE INDEX "idx_social_tradings_netprofit" ON "social_tradings" USING btree ("net_profit");--> statement-breakpoint
CREATE INDEX "idx_social_tradings_followers" ON "social_tradings" USING btree ("followers");--> statement-breakpoint
CREATE INDEX "idx_social_tradings_reputation" ON "social_tradings" USING btree ("reputation");--> statement-breakpoint
CREATE INDEX "idx_social_tradings_status" ON "social_tradings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_social_handles_category_order" ON "social_handles" USING btree ("category","order");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_social_follows_unique" ON "social_follows" USING btree ("follower_id","trader_id");--> statement-breakpoint
CREATE INDEX "idx_courses_category" ON "courses" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_courses_published" ON "courses" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "idx_course_modules_course" ON "course_modules" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_course_lessons_module" ON "course_lessons" USING btree ("module_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_course_progress_unique" ON "course_progresses" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_created" ON "transactions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_transactions_status" ON "transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_transactions_type" ON "transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_transactions_category" ON "transactions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_transactions_external_ref" ON "transactions" USING btree ("external_reference");--> statement-breakpoint
CREATE INDEX "idx_transactions_crypto_txhash" ON "transactions" USING btree (("crypto"->>'txHash'));--> statement-breakpoint
CREATE INDEX "idx_crypto_wallets_user_chain" ON "crypto_wallets" USING btree ("user_id","chain");--> statement-breakpoint
CREATE INDEX "idx_saved_bank_accounts_user" ON "saved_bank_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_pending_withdrawals_user_status" ON "pending_withdrawals" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_pending_withdrawals_status_created" ON "pending_withdrawals" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_bonus_claims_unique" ON "bonus_claims" USING btree ("user_id","bonus_activity_id");--> statement-breakpoint
CREATE INDEX "idx_analyses_author_type" ON "analyses" USING btree ("author_id","type");--> statement-breakpoint
CREATE INDEX "idx_analyses_pair" ON "analyses" USING btree ("pair");--> statement-breakpoint
CREATE INDEX "idx_trading_bots_user_status" ON "trading_bots" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_trading_bots_strategy" ON "trading_bots" USING btree ("strategy");--> statement-breakpoint
CREATE INDEX "idx_trading_accounts_user_platform" ON "trading_accounts" USING btree ("user_id","platform");--> statement-breakpoint
CREATE INDEX "idx_trade_journals_user_entry" ON "trade_journals" USING btree ("user_id","entry_time");--> statement-breakpoint
CREATE INDEX "idx_trade_journals_user_symbol" ON "trade_journals" USING btree ("user_id","symbol");--> statement-breakpoint
CREATE INDEX "idx_trade_journals_user_status" ON "trade_journals" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_trading_signals_provider_status" ON "trading_signals" USING btree ("provider_id","status");--> statement-breakpoint
CREATE INDEX "idx_trading_signals_pair" ON "trading_signals" USING btree ("pair");--> statement-breakpoint
CREATE INDEX "idx_fundamental_data_indicator" ON "fundamental_data" USING btree ("indicator");--> statement-breakpoint
CREATE INDEX "idx_fundamental_data_release" ON "fundamental_data" USING btree ("release_date");--> statement-breakpoint
CREATE INDEX "idx_fundamental_data_country_indicator" ON "fundamental_data" USING btree ("country","indicator","release_date");--> statement-breakpoint
CREATE INDEX "idx_cot_reports_asset_date" ON "cot_reports" USING btree ("asset","reporting_date");--> statement-breakpoint
CREATE INDEX "idx_copy_trades_follower_provider" ON "copy_trades" USING btree ("follower_id","provider_id");--> statement-breakpoint
CREATE INDEX "idx_copy_trades_provider_executed" ON "copy_trades" USING btree ("provider_id","executed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_copy_subs_unique" ON "copy_subscriptions" USING btree ("follower_id","provider_id","follower_account_id");--> statement-breakpoint
CREATE INDEX "idx_mlm_commissions_user_created" ON "mlm_commissions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_mlm_commissions_type_status" ON "mlm_commissions" USING btree ("type","status");--> statement-breakpoint
CREATE INDEX "idx_mlm_commissions_period" ON "mlm_commissions" USING btree ("period_start","period_end");--> statement-breakpoint
CREATE INDEX "idx_mlm_tree_sponsor" ON "mlm_tree_nodes" USING btree ("sponsor_id");--> statement-breakpoint
CREATE INDEX "idx_mlm_tree_parent_position" ON "mlm_tree_nodes" USING btree ("parent_id","position");--> statement-breakpoint
CREATE INDEX "idx_mlm_tree_path" ON "mlm_tree_nodes" USING gist ("path");--> statement-breakpoint
CREATE INDEX "idx_mlm_tree_depth" ON "mlm_tree_nodes" USING btree ("depth");--> statement-breakpoint
CREATE INDEX "idx_mlm_volume_user_period" ON "mlm_volume_histories" USING btree ("user_id","period_start");--> statement-breakpoint
CREATE INDEX "idx_mlm_volume_type_start" ON "mlm_volume_histories" USING btree ("period_type","period_start");--> statement-breakpoint
CREATE INDEX "idx_mlm_rank_history_user" ON "mlm_rank_histories" USING btree ("user_id","achieved_at");--> statement-breakpoint
CREATE INDEX "idx_kyc_docs_user_type" ON "kyc_documents" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "idx_kyc_docs_status" ON "kyc_documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_aml_checks_user" ON "aml_checks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_aml_checks_transaction" ON "aml_checks" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "idx_aml_checks_status_review" ON "aml_checks" USING btree ("status","review_required");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_user_status" ON "support_tickets" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_status_priority" ON "support_tickets" USING btree ("status","priority");--> statement-breakpoint
CREATE INDEX "idx_system_configs_category" ON "system_configs" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_read" ON "notifications" USING btree ("user_id","read");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_created" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_activity_logs_user_created" ON "activity_logs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_activity_logs_action_created" ON "activity_logs" USING btree ("action","created_at");--> statement-breakpoint
CREATE INDEX "idx_activity_logs_category_created" ON "activity_logs" USING btree ("category","created_at");--> statement-breakpoint
CREATE INDEX "idx_activity_logs_created" ON "activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_investment_pools_status" ON "investment_pools" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_investment_pools_category" ON "investment_pools" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_pool_investments_user_pool" ON "pool_investments" USING btree ("user_id","pool_id");--> statement-breakpoint
CREATE INDEX "idx_pool_investments_pool_status" ON "pool_investments" USING btree ("pool_id","status");--> statement-breakpoint
CREATE INDEX "idx_investments_user_pool" ON "investments" USING btree ("user_id","pool_id");--> statement-breakpoint
CREATE INDEX "idx_news_articles_published" ON "news_articles" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "idx_news_articles_category_published" ON "news_articles" USING btree ("category","is_published");