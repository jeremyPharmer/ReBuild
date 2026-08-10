export type AlignmentStatus = "aligned" | "return_to_use" | "other";

/** Built-in or custom support id (e.g. "gym", "custom_walk") */
export type SupportType = string;

export type SupportConfig = {
  type: SupportType;
  label: string;
  weeklyTarget: number;
  enabled: boolean;
};

export type MilestoneType = "checkpoint" | "reward" | "destination";

export type MilestoneDef = {
  dayNumber: number;
  type: MilestoneType;
  title: string;
  reflectionPrompt?: string;
};

export type RewardCategory =
  | "clothing"
  | "wellness"
  | "experiences"
  | "growth"
  | "travel"
  | "other";

export type MorningCheckIn = {
  date: string;
  sleepHours: number;
  sleepQuality: number;
  mood: number;
  energy: number;
  stress: number;
  craving: number;
  intention: string;
  trigger?: string;
  notes?: string;
  completedAt: string;
};

export type EveningCheckIn = {
  date: string;
  mood: number;
  craving: number;
  alignment: AlignmentStatus;
  returnNotes?: string;
  oneLine: string;
  expandedJournal?: string;
  completedAt: string;
};

export type SupportCompletion = {
  date: string;
  supportType: SupportType;
  completed: boolean;
  notes?: string;
  /** For recovery content: what will you do differently? */
  actionNote?: string;
  completedAt: string;
};

/** Support type, or morning/evening check-in */
export type SkipItemKey = SupportType | "morning" | "evening";

/** Dismiss a Today's Rebuild item for a calendar day */
export type DailySkip = {
  date: string;
  itemKey: SkipItemKey;
  skippedAt: string;
};

export type ReclaimDay = {
  date: string;
  estimatedAmount: number;
  accounted: boolean;
  reclaimedAmount?: number;
  confirmedAt?: string;
  transferId?: string;
};

export type FinancialTransfer = {
  id: string;
  amount: number;
  date: string;
  dayDates: string[];
  userConfirmed: boolean;
  note?: string;
  createdAt: string;
  /** Split applied at confirm time */
  split?: { future: number; rebuild: number; treat: number };
};

/** Venmo-matching balances still set aside */
export type FundLedger = {
  future: number;
  rebuild: number;
  treat: number;
};

export type MilestoneDecision = {
  id: string;
  milestoneAchievementId: string;
  dayNumber: number;
  choice: "save" | "treat";
  /** Save: $ moved into Treat. Treat: $ spent from Treat. */
  amount: number;
  rewardId?: string;
  note?: string;
  createdAt: string;
};

export type Reward = {
  id: string;
  name: string;
  category: RewardCategory;
  estimatedCost: number;
  actualCost?: number;
  assignedMilestoneDay?: number;
  executed: boolean;
  executedAt?: string;
  notes?: string;
  createdAt: string;
};

export type MilestoneAchievement = {
  id: string;
  dayNumber: number;
  title: string;
  type: MilestoneType;
  runId: string;
  cleanDaysAtAchieve: number;
  achievedAt: string;
  reflection?: string;
  rewardEligible: boolean;
};

export type ReturnEvent = {
  id: string;
  date: string;
  notes?: string;
  previousCleanDays: number;
  runIdEnded: string;
  createdAt: string;
};

export type CravingEvent = {
  id: string;
  at: string;
  intensityBefore: number;
  intensityAfter?: number;
  situation: string;
  intervention: string;
  outcome?: string;
};

export type WeeklyBonus = {
  id: string;
  weekStart: string;
  amount: number;
  confirmed: boolean;
  confirmedAt?: string;
};

export type JournalEntry = {
  id: string;
  date: string;
  type: "one_line" | "journal" | "progress_note" | "life_event";
  text: string;
  tags?: string[];
  createdAt: string;
};

export type RebuildProfile = {
  id: string;
  createdAt: string;
  onboarded: boolean;
  displayName: string;
  /** Combined historical daily spend for cannabis + alcohol */
  historicalDailySpend: number;
  startDate: string;
  /** Current run id; changes after return-to-use */
  currentRunId: string;
  currentRunStartedOn: string;
  supports: SupportConfig[];
  timezone: string;
};

export type RebuildState = {
  profile: RebuildProfile | null;
  mornings: MorningCheckIn[];
  evenings: EveningCheckIn[];
  supports: SupportCompletion[];
  reclaimDays: ReclaimDay[];
  transfers: FinancialTransfer[];
  rewards: Reward[];
  milestones: MilestoneAchievement[];
  returns: ReturnEvent[];
  cravings: CravingEvent[];
  weeklyBonuses: WeeklyBonus[];
  journals: JournalEntry[];
  /** Today's Rebuild items dismissed for a given date */
  skips: DailySkip[];
  /** Venmo-matching segmented balances */
  fund: FundLedger;
  /** Consecutive Save choices since last Treat (max 2, then forced Treat) */
  consecutiveSaves: number;
  milestoneDecisions: MilestoneDecision[];
};

export const DEFAULT_SUPPORTS: SupportConfig[] = [
  {
    type: "recovery_content",
    label: "Recovery content",
    weeklyTarget: 2,
    enabled: true,
  },
  {
    type: "meditation",
    label: "Meditation",
    weeklyTarget: 5,
    enabled: true,
  },
  {
    type: "medication",
    label: "Medication",
    weeklyTarget: 7,
    enabled: true,
  },
  {
    type: "gym",
    label: "Gym",
    weeklyTarget: 4,
    enabled: true,
  },
];

export const MILESTONE_DEFS: MilestoneDef[] = [
  { dayNumber: 1, type: "checkpoint", title: "Begin" },
  { dayNumber: 2, type: "checkpoint", title: "Keep Going" },
  { dayNumber: 3, type: "reward", title: "First Win" },
  { dayNumber: 5, type: "checkpoint", title: "Momentum" },
  { dayNumber: 7, type: "reward", title: "One Week" },
  { dayNumber: 10, type: "checkpoint", title: "Finding Your Rhythm" },
  { dayNumber: 14, type: "reward", title: "Two Weeks" },
  { dayNumber: 21, type: "checkpoint", title: "Three Weeks" },
  {
    dayNumber: 30,
    type: "destination",
    title: "One Month",
    reflectionPrompt: "What is different about your life compared with Day 1?",
  },
  { dayNumber: 45, type: "reward", title: "Six Weeks" },
  { dayNumber: 60, type: "reward", title: "Two Months" },
  { dayNumber: 75, type: "reward", title: "Checkpoint Reward" },
  {
    dayNumber: 90,
    type: "destination",
    title: "Three-Month Destination",
    reflectionPrompt: "What are you building that you couldn't see at the beginning?",
  },
  { dayNumber: 105, type: "reward", title: "Next Horizon" },
  { dayNumber: 120, type: "reward", title: "Four Months" },
  { dayNumber: 150, type: "reward", title: "Five Months" },
  {
    dayNumber: 180,
    type: "destination",
    title: "Six-Month Destination",
    reflectionPrompt: "What are you no longer willing to give up?",
  },
  { dayNumber: 210, type: "reward", title: "Seven Months" },
  { dayNumber: 240, type: "reward", title: "Eight Months" },
  { dayNumber: 270, type: "destination", title: "Major Destination" },
  { dayNumber: 300, type: "reward", title: "Ten Months" },
  { dayNumber: 330, type: "reward", title: "Eleven Months" },
  {
    dayNumber: 365,
    type: "destination",
    title: "The Rebuild Year",
    reflectionPrompt: "What did you rebuild?",
  },
];
