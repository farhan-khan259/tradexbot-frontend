export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  balance: number;
  basic_funded_balance: number;
  pro_funded_balance: number;
  purchased_bot_ids: string[];
  referral_code: string;
  created_at: string;
  referred_by_id?: string | null;
}

export type TransactionType = "deposit" | "withdrawal" | "referral_bonus";
export type TransactionStatus = "pending" | "approved" | "rejected";

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  note: string | null;
  screenshot_data?: string | null;
  account_name?: string | null;
  wallet_address?: string | null;
  network?: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface ReferredUser {
  full_name: string;
  email: string;
  bonus_amount: number;
}

export interface ReferralSummary {
  referral_code: string;
  total_referrals: number;
  total_bonus: number;
  referred_users: ReferredUser[];
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  admin_users: number;
  new_users_7d: number;
  total_balance: number;
  deposits_pending_count: number;
  deposits_approved_count: number;
  deposits_total_amount: number;
  withdrawals_pending_count: number;
  withdrawals_approved_count: number;
  withdrawals_total_amount: number;
  referral_bonus_total: number;
}
