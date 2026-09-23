export type OnboardingStep = "profile" | "english" | "identity" | "complete";
export type IdentityStatus = "not_started" | "pending" | "approved" | "rejected";
export type StudyKind = "survey" | "usability" | "short_poll" | "multi_day";
export type SubmissionStatus = "in_progress" | "pending_review" | "approved" | "rejected";
export type PayoutNetwork = "usdt_trc20" | "ltc";
export type UserRole = "participant" | "admin";
export type AccountStatus = "active" | "suspended";
export type WithdrawalStatus = "processing" | "sent" | "rejected";
export type LedgerType = "deposit" | "adjustment" | "study" | "withdrawal" | "marketer";
export type StudyTier = 1 | 2 | 3;
export type MarketerJobStatus = "processing" | "complete" | "failed";
export type DepositRequestStatus = "pending" | "approved" | "rejected";
export type DepositPurpose = "activation" | "marketer";

export type Profile = {
  legalName: string;
  dateOfBirth: string;
  gender: string;
  country: string;
  city: string;
  region: string;
  postalCode: string;
  languages: string[];
  occupation: string;
};

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  accountStatus: AccountStatus;
  referralCode: string;
  referredBy: string | null;
  createdAt: string;
  profile: Profile | null;
  englishPassed: boolean;
  englishWriting: string;
  identityStatus: IdentityStatus;
  identityNote: string;
  onboardingStep: OnboardingStep;
  available: number;
  pending: number;
  withdrawn: number;
  payout: {
    network: PayoutNetwork;
    address: string;
    addressChangedAt: string | null;
  };
  lastWithdrawalAt: string | null;
  walletActivated: boolean;
  detectedCountry: string | null;
};

export type Question = {
  id: string;
  type: "single" | "multi" | "text" | "scale" | "attention";
  prompt: string;
  options?: string[];
  required?: boolean;
  correct?: string;
};

export type Study = {
  id: string;
  title: string;
  summary: string;
  kind: StudyKind;
  reward: number;
  minutes: number;
  format: string;
  device: string;
  published: boolean;
  tier: StudyTier;
  questions: Question[];
};

export type Submission = {
  id: string;
  userId: string;
  studyId: string;
  status: SubmissionStatus;
  answers: Record<string, string | string[]>;
  startedAt: string;
  updatedAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  autoApproveAt: string | null;
};

export type Withdrawal = {
  id: string;
  userId: string;
  network: PayoutNetwork;
  address: string;
  requested: number;
  platformFee: number;
  networkFee: number;
  arrives: number;
  status: WithdrawalStatus;
  createdAt: string;
  reviewedAt: string | null;
  adminNote: string | null;
};

export type LedgerEntry = {
  id: string;
  userId: string;
  amount: number;
  type: LedgerType;
  note: string;
  createdAt: string;
  adminEmail: string | null;
};

export type MarketerJob = {
  id: string;
  userId: string;
  marketerId: string;
  quantity: number;
  priceEach: number;
  hiredAt: string;
  completeAt: string;
  completedAt: string | null;
  status: MarketerJobStatus;
  addedUserIds: string[];
};

export type ChatMessage = {
  id: string;
  userId: string;
  from: "user" | "support";
  body: string;
  createdAt: string;
};

export type DepositRequest = {
  id: string;
  userId: string;
  amount: number;
  method: string;
  methodLabel: string;
  purpose: DepositPurpose;
  marketerId: string | null;
  quantity: number | null;
  status: DepositRequestStatus;
  createdAt: string;
  reviewedAt: string | null;
  adminNote: string | null;
  adminEmail: string | null;
};

export type StoreData = {
  users: User[];
  submissions: Submission[];
  withdrawals: Withdrawal[];
  studies: Study[];
  ledger: LedgerEntry[];
  marketerJobs: MarketerJob[];
  chat: ChatMessage[];
  deposits: DepositRequest[];
};
