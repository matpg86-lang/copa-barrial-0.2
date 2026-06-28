import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const db = createClient(
    "https://jszgafljtsyohksffjdd.supabase.co",
    "sb_publishable_bTNuABiFd42Ts1zDF8uZRg_pmcEYOPc"
);