// Builds a STATIC, demo-mode snapshot of the Studio for GitHub Pages.
// It works on a temporary copy so the real app (server actions, auth, proxy) is untouched.
import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync, readFileSync, existsSync, symlinkSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const work = path.join(root, ".pages-build");
const base = process.env.PAGES_BASE_PATH ?? "/DigitalOnKAMY";

rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });
for (const name of readdirSync(root)) {
  if ([".git", ".next", ".pages-build", "node_modules", "out", ".env.local"].includes(name)) continue;
  cpSync(path.join(root, name), path.join(work, name), { recursive: true });
}
symlinkSync(path.join(root, "node_modules"), path.join(work, "node_modules"), "junction");

const w = (rel, content) => writeFileSync(path.join(work, rel), content);
const patch = (rel, fn) => {
  const p = path.join(work, rel);
  writeFileSync(p, fn(readFileSync(p, "utf8")));
};

// Not possible on a static host.
for (const rel of ["src/proxy.ts", "src/app/auth"]) rmSync(path.join(work, rel), { recursive: true, force: true });

const DEMO_ERR = `{ ok: false as const, error: "errors.generic" as const }`;
w("src/app/studio/onboarding/actions.ts", `import type { ActionResult } from "@/lib/errors";
export async function checkSlugAction(slug: string): Promise<{ valid: boolean; available: boolean }> { return { valid: /^[a-z0-9-]{3,40}$/.test(slug), available: true }; }
export async function createStoreAction(_input: unknown): Promise<ActionResult<{ merchantId: string }>> { return ${DEMO_ERR}; }
export async function acceptPolicyAction(_m: string, _d: string): Promise<ActionResult> { return ${DEMO_ERR}; }
`);
w("src/app/studio/storefront/actions.ts", `import type { ActionResult } from "@/lib/errors";
export async function updateStorefrontAction(_input: unknown): Promise<ActionResult> { return ${DEMO_ERR}; }
export async function uploadMerchantImageAction(_f: FormData): Promise<ActionResult<{ url: string }>> { return ${DEMO_ERR}; }
export async function removeMerchantImageAction(_k: "avatar" | "banner"): Promise<ActionResult> { return ${DEMO_ERR}; }
`);
w("src/app/(auth)/actions.ts", `import type { MessageKey } from "@/i18n/core";
export type AuthState = { error?: MessageKey; fieldErrors?: Partial<Record<"email" | "password" | "displayName", MessageKey>>; checkEmail?: string };
export async function signInAction(_p: AuthState, _f: FormData): Promise<AuthState> { return { error: "errors.generic" }; }
export async function signUpAction(_p: AuthState, _f: FormData): Promise<AuthState> { return { error: "errors.generic" }; }
`);
w("src/app/actions/locale.ts", `export async function setLocaleAction(locale: string): Promise<void> { try { localStorage.setItem("kamy_locale", locale); } catch {} }
export async function setRailCollapsedAction(_c: boolean): Promise<void> {}
`);
w("src/i18n/server.ts", `import { createTranslator, DEFAULT_LOCALE, type Locale } from "./core";
export async function getLocale(): Promise<Locale> { return DEFAULT_LOCALE; }
export async function getTranslator() { const locale = await getLocale(); return { locale, t: createTranslator(locale) }; }
`);
w("src/lib/supabase/server.ts", `// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createSupabaseServerClient(): Promise<any> { throw new Error("Static demo build has no server client"); }
`);
patch("src/app/studio/layout.tsx", (s) =>
  s.replace(`import { cookies } from "next/headers";\n`, "").replace(`(await cookies()).get("kamy_rail")?.value === "collapsed"`, "false"));
patch("src/app/c/[slug]/page.tsx", (s) => s + `\nexport const dynamicParams = false;\nexport function generateStaticParams() { return [{ slug: "nusantara-lowpoly" }]; }\n`);
patch("src/app/studio/[section]/page.tsx", (s) => s + `\nexport const dynamicParams = false;\nexport function generateStaticParams() { return ["products","orders","customers","reviews","analytics","earnings","promotions","messages","team","help"].map((section) => ({ section })); }\n`);

// Static export has no query string at build time: use defaults.
const NOQ = "Promise.resolve({} as Record<string, string | string[] | undefined>)";
patch("src/app/(auth)/sign-in/page.tsx", (s) => s.replace("await searchParams", "await " + NOQ));
patch("src/app/(auth)/sign-up/page.tsx", (s) => s.replace(/await searchParams/g, "await " + NOQ));
patch("src/app/studio/overview/page.tsx", (s) => s.replace("getStudioContext(), searchParams]", "getStudioContext(), " + NOQ + "]"));
patch("src/app/studio/onboarding/page.tsx", (s) => s.replace("getCurrentPolicies(),\n    searchParams,", "getCurrentPolicies(),\n    " + NOQ + ","));

// Plain <a>/<img>/<form> do not get the basePath automatically.
const B = "${process.env.NEXT_PUBLIC_BASE_PATH ?? \"\"}";
patch("src/components/brand/logo.tsx", (s) => s.replace(/src="\/brand\/([^"]+)"/g, "src={`" + B + "/brand/$1`}"));
patch("src/app/studio/overview/page.tsx", (s) => s.replace("<a href={item.href}", "<a href={`" + B + "${item.href}`}"));
patch("src/app/studio/storefront/storefront-editor.tsx", (s) => s.replace("<a href={`/c/${slug}`}", "<a href={`" + B + "/c/${slug}`}"));
patch("src/components/studio/shell.tsx", (s) => s.replaceAll('action="/auth/sign-out" method="post"', 'action={`' + B + '/sign-in`} method="get"'));

w("next.config.ts", `import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "export",
  basePath: "${base}",
  trailingSlash: true,
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true }, // the real app is type-checked separately; stubs here are loose
  turbopack: { rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } } },
};
export default nextConfig;
`);

const env = { ...process.env, KAMY_DEMO_MODE: "true", NEXT_PUBLIC_BASE_PATH: base, NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "" };
rmSync(path.join(work, ".env.local"), { force: true });
execSync("npx next build", { cwd: work, stdio: "inherit", env });
if (!existsSync(path.join(work, "out", "index.html"))) throw new Error("No static output produced");
rmSync(path.join(root, "out"), { recursive: true, force: true });
cpSync(path.join(work, "out"), path.join(root, "out"), { recursive: true });
writeFileSync(path.join(root, "out", ".nojekyll"), "");
console.log("Static demo built in ./out (base path " + base + ")");
