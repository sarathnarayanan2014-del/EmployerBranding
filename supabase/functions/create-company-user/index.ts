// Supabase Edge Function: create-company-user
// Called by the Admin dashboard to create a new company login.
// Runs server-side on Supabase's infra, so it's the only place the
// service_role key is used — it never touches the browser.
//
// Deploy with:
//   supabase functions deploy create-company-user
// Set the required secret once with:
//   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller is an authenticated admin before doing anything.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await callerClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: corsHeaders });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();
    if (!profile || profile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin only" }), { status: 403, headers: corsHeaders });
    }

    const { email, password, clientId, displayName } = await req.json();
    if (!email || !password || !clientId) {
      return new Response(JSON.stringify({ error: "email, password and clientId are required" }), { status: 400, headers: corsHeaders });
    }

    // Create the auth user
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr) {
      return new Response(JSON.stringify({ error: createErr.message }), { status: 400, headers: corsHeaders });
    }

    // Link them to the client as a 'company' profile
    const { error: profileErr } = await admin.from("profiles").insert({
      id: created.user.id,
      role: "company",
      client_id: clientId,
      display_name: displayName || email,
    });
    if (profileErr) {
      return new Response(JSON.stringify({ error: profileErr.message }), { status: 400, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ ok: true, userId: created.user.id }), { status: 200, headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
