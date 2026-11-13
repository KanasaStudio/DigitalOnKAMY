"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { Icon, type IconName } from "@/components/icons/icon";
import { PolicyBody } from "@/components/policy/policy-body";
import { Button, ButtonLink } from "@/components/ui/button";
import { ChipSelect } from "@/components/ui/chip-select";
import { Checkbox, RadioCard } from "@/components/ui/choice";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/misc";
import { Spinner } from "@/components/ui/spinner";
import { Stepper, type Step } from "@/components/ui/stepper";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/i18n/client";
import type { MessageKey } from "@/i18n/core";
import { formatDate } from "@/i18n/format";
import type { ActionResult, FieldError } from "@/lib/errors";
import { slugify } from "@/lib/validation/merchant";
import { acceptPolicyAction, checkSlugAction, createStoreAction } from "./actions";

export type OnboardingPolicy = {
  id: string;
  version: string;
  title: string;
  summary: string[];
  body: string;
  acceptedAt: string | null;
} | null;

export type OnboardingCategory = { id: string; label: string; icon: IconName };

type StepId = "account" | "identity" | "agreement" | "ownership" | "payout" | "done";
type MainStep = Exclude<StepId, "done">;
const ORDER: MainStep[] = ["account", "identity", "agreement", "ownership", "payout"];
const DRAFT_KEY = "kamy:onboarding-draft:v1";

type Draft = { type: "individual" | "studio"; storeName: string; slug: string; slugEdited: boolean; tagline: string; specialties: string[] };
const EMPTY_DRAFT: Draft = { type: "individual", storeName: "", slug: "", slugEdited: false, tagline: "", specialties: [] };

function readDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? { ...EMPTY_DRAFT, ...(JSON.parse(raw) as Partial<Draft>) } : null;
  } catch {
    return null;
  }
}

export function OnboardingFlow({
  demo,
  merchant,
  canAccept,
  categories,
  seller,
  ownership,
  initialStep,
}: {
  demo: boolean;
  merchant: { id: string; type: "individual" | "studio"; storeName: string; slug: string } | null;
  canAccept: boolean;
  categories: OnboardingCategory[];
  seller: OnboardingPolicy;
  ownership: OnboardingPolicy;
  initialStep: string | null;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const hasStore = Boolean(merchant);
  const done: Record<MainStep, boolean> = {
    account: hasStore,
    identity: hasStore,
    agreement: Boolean(seller?.acceptedAt),
    ownership: Boolean(ownership?.acceptedAt),
    payout: false,
  };
  const firstOpen = ORDER.find((id) => !done[id]) ?? "payout";
  const [step, setStep] = useState<StepId>(
    initialStep && (ORDER as string[]).includes(initialStep) && (hasStore || ["account", "identity"].includes(initialStep))
      ? (initialStep as MainStep)
      : firstOpen,
  );

  // ---- Draft (persisted locally so a refresh or closed tab never loses input) ----
  // This component renders client-only, so reading storage in the initializer is safe.
  const [initialDraft] = useState<Draft | null>(() => {
    if (hasStore) return null;
    const saved = readDraft();
    return saved && (saved.storeName || saved.tagline || saved.specialties.length) ? saved : null;
  });
  const [draft, setDraft] = useState<Draft>(initialDraft ?? EMPTY_DRAFT);
  const restored = Boolean(initialDraft);
  useEffect(() => {
    if (hasStore) return;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* storage unavailable: the in-memory draft still works */
    }
  }, [draft, hasStore]);
  const update = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  // ---- Slug availability (debounced). Status is derived; only the async result is state. ----
  const [slugResult, setSlugResult] = useState<{ slug: string; status: "available" | "taken" | "invalid" | "idle" } | null>(null);
  useEffect(() => {
    if (hasStore || !draft.slug) return;
    const slug = draft.slug;
    const handle = window.setTimeout(async () => {
      try {
        const result = await checkSlugAction(slug);
        setSlugResult({ slug, status: !result.valid ? "invalid" : result.available ? "available" : "taken" });
      } catch {
        setSlugResult({ slug, status: "idle" });
      }
    }, 400);
    return () => window.clearTimeout(handle);
  }, [draft.slug, hasStore]);
  const slugStatus: "idle" | "checking" | "available" | "taken" | "invalid" =
    hasStore || !draft.slug ? "idle" : slugResult?.slug === draft.slug ? slugResult.status : "checking";

  const [fieldErrors, setFieldErrors] = useState<Record<string, FieldError>>({});
  const [formError, setFormError] = useState<MessageKey | null>(null);
  const fe = (name: string) => (fieldErrors[name] ? t(fieldErrors[name].key, fieldErrors[name].vars) : undefined);

  const handleResult = (result: ActionResult | ActionResult<{ merchantId: string }>, onOk: () => void) => {
    if (result.ok) {
      setFormError(null);
      setFieldErrors({});
      onOk();
      return;
    }
    setFieldErrors(result.fieldErrors ?? {});
    setFormError(result.fieldErrors && Object.keys(result.fieldErrors).length ? null : result.error);
    if (result.error === "demo.writesDisabled") toast.show(t("demo.writesDisabled"), { tone: "info" });
  };

  const validateIdentity = (): boolean => {
    const errors: Record<string, FieldError> = {};
    if (draft.storeName.trim().length < 2) errors.storeName = { key: "validation.minLength", vars: { field: t("onboarding.identity.storeName"), min: 2 } };
    if (slugStatus === "invalid" || !draft.slug) errors.slug = { key: "validation.slugFormat" };
    if (slugStatus === "taken") errors.slug = { key: "validation.slugTaken" };
    if (draft.specialties.length === 0) errors.specialties = { key: "validation.pickAtLeastOne", vars: { field: t("onboarding.identity.specialties").toLowerCase() } };
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createStore = () => {
    if (!validateIdentity()) return;
    startTransition(async () => {
      const result = await createStoreAction({
        type: draft.type,
        storeName: draft.storeName,
        slug: draft.slug,
        tagline: draft.tagline,
        specialties: draft.specialties,
      });
      handleResult(result, () => {
        try {
          window.localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* ignore */
        }
        setStep("agreement");
        router.refresh();
      });
    });
  };

  const accept = (doc: NonNullable<OnboardingPolicy>, next: StepId) => {
    if (!merchant) return;
    startTransition(async () => {
      const result = await acceptPolicyAction(merchant.id, doc.id);
      handleResult(result, () => {
        setStep(next);
        router.refresh();
      });
    });
  };

  const steps: Step[] = ORDER.map((id) => ({
    id,
    label: t(`onboarding.steps.${id}`),
    done: done[id],
    disabled: !hasStore && !["account", "identity"].includes(id),
  }));
  const index = step === "done" ? -1 : ORDER.indexOf(step);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-[220px_minmax(0,1fr)]">
      <div className="min-w-0 md:sticky md:top-24 md:self-start">
        <Stepper steps={steps} current={step} onSelect={(id) => setStep(id as StepId)} label={t("onboarding.title")} />
      </div>

      <div className="flex min-w-0 max-w-2xl flex-col gap-6">
        {index >= 0 ? <p className="label-mono">{t("onboarding.stepOf", { current: index + 1, total: ORDER.length })}</p> : null}
        {restored && !hasStore ? (
          <p className="flex items-center gap-2 text-sm text-silver" role="status">
            <Icon name="history" size={16} />
            {t("onboarding.draftRestored")}
          </p>
        ) : null}
        {formError ? (
          <p role="alert" className="flex items-start gap-2 rounded-[10px] bg-graphite px-3 py-2.5 text-sm text-cloud shadow-[inset_3px_0_0_#f4f5f7]">
            <Icon name="error" size={16} className="mt-0.5" />
            {t(formError, { role: t("roles.admin") })}
          </p>
        ) : null}

        {step === "account" ? (
          <StepFrame heading={t("onboarding.account.heading")} body={t("onboarding.account.body")}>
            <fieldset className="grid gap-3 sm:grid-cols-2" disabled={hasStore}>
              <legend className="sr-only">{t("onboarding.account.heading")}</legend>
              <RadioCard
                name="type"
                value="individual"
                icon="user"
                label={t("onboarding.account.individual")}
                description={t("onboarding.account.individualBody")}
                checked={(merchant?.type ?? draft.type) === "individual"}
                onChange={() => update({ type: "individual" })}
              />
              <RadioCard
                name="type"
                value="studio"
                icon="users"
                label={t("onboarding.account.studio")}
                description={t("onboarding.account.studioBody")}
                checked={(merchant?.type ?? draft.type) === "studio"}
                onChange={() => update({ type: "studio" })}
              />
            </fieldset>
            <Actions>
              <Button iconRight="arrowRight" onClick={() => setStep("identity")}>
                {t("common.continue")}
              </Button>
            </Actions>
          </StepFrame>
        ) : null}

        {step === "identity" ? (
          <StepFrame heading={t("onboarding.identity.heading")} body={t("onboarding.identity.body")}>
            {hasStore && merchant ? (
              <Panel className="flex items-center justify-between gap-4 p-4">
                <div className="flex flex-col">
                  <span className="font-semibold">{merchant.storeName}</span>
                  <span className="font-mono text-xs text-silver">kamy.id/c/{merchant.slug}</span>
                </div>
                <ButtonLink href="/studio/storefront" variant="secondary" size="sm" icon="edit">
                  {t("common.edit")}
                </ButtonLink>
              </Panel>
            ) : (
              <form
                className="flex flex-col gap-5"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  createStore();
                }}
              >
                <Field
                  label={t("onboarding.identity.storeName")}
                  hint={t("onboarding.identity.storeNameHint")}
                  required
                  error={fe("storeName")}
                  counter={{ count: draft.storeName.length, max: 60 }}
                >
                  {(control) => (
                    <Input
                      {...control}
                      value={draft.storeName}
                      maxLength={60}
                      autoComplete="organization"
                      onChange={(e) => {
                        const storeName = e.target.value;
                        update(draft.slugEdited ? { storeName } : { storeName, slug: slugify(storeName) });
                      }}
                    />
                  )}
                </Field>

                <Field
                  label={t("onboarding.identity.slug")}
                  hint={<SlugHint status={slugStatus} fallback={t("onboarding.identity.slugHint")} />}
                  required
                  error={fe("slug")}
                >
                  {(control) => (
                    <Input
                      {...control}
                      value={draft.slug}
                      prefix="kamy.id/c/"
                      maxLength={40}
                      spellCheck={false}
                      autoCapitalize="none"
                      className="font-mono text-sm [--prefix-w:6.4rem]"
                      onChange={(e) => update({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""), slugEdited: true })}
                      suffix={slugStatus === "checking" ? <Spinner className="text-silver" /> : slugStatus === "available" ? <Icon name="success" size={18} className="text-mint" /> : null}
                    />
                  )}
                </Field>

                <Field
                  label={t("onboarding.identity.tagline")}
                  hint={t("onboarding.identity.taglineHint")}
                  optional
                  counter={{ count: draft.tagline.length, max: 120 }}
                  error={fe("tagline")}
                >
                  {(control) => <Input {...control} value={draft.tagline} maxLength={120} onChange={(e) => update({ tagline: e.target.value })} />}
                </Field>

                <SpecialtiesField
                  categories={categories}
                  value={draft.specialties}
                  onChange={(specialties) => update({ specialties })}
                  error={fe("specialties")}
                />

                <Actions>
                  <Button variant="ghost" icon="arrowLeft" onClick={() => setStep("account")}>
                    {t("common.back")}
                  </Button>
                  <Button type="submit" loading={pending} iconRight="arrowRight">
                    {t("onboarding.identity.create")}
                  </Button>
                </Actions>
              </form>
            )}
            {hasStore ? (
              <Actions>
                <Button iconRight="arrowRight" onClick={() => setStep("agreement")}>
                  {t("common.continue")}
                </Button>
              </Actions>
            ) : null}
          </StepFrame>
        ) : null}

        {step === "agreement" ? (
          <PolicyStep
            doc={seller}
            heading={t("onboarding.agreement.heading")}
            body={t("onboarding.agreement.body")}
            checkboxLabel={seller ? t("onboarding.agreement.checkbox", { version: seller.version }) : ""}
            acceptLabel={t("onboarding.agreement.accept")}
            pending={pending}
            canAccept={canAccept}
            locale={locale}
            onAccept={() => seller && accept(seller, ownership?.acceptedAt ? "payout" : "ownership")}
            onNext={() => setStep("ownership")}
          />
        ) : null}

        {step === "ownership" ? (
          <PolicyStep
            doc={ownership}
            heading={t("onboarding.ownership.heading")}
            body={t("onboarding.ownership.body")}
            checkboxLabel={t("onboarding.ownership.checkbox")}
            acceptLabel={t("onboarding.ownership.accept")}
            pending={pending}
            canAccept={canAccept}
            locale={locale}
            onAccept={() => ownership && accept(ownership, "payout")}
            onNext={() => setStep("payout")}
          />
        ) : null}

        {step === "payout" ? (
          <StepFrame heading={t("onboarding.payout.heading")}>
            <Panel className="flex gap-4 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-line bg-obsidian text-silver">
                <Icon name="offline" size={20} />
              </span>
              <div className="flex flex-col gap-1.5">
                <p className="font-semibold">{t("onboarding.payout.notConnectedTitle")}</p>
                <p className="text-sm leading-relaxed text-silver">{t("onboarding.payout.notConnectedBody")}</p>
              </div>
            </Panel>
            <Actions>
              <Button iconRight="arrowRight" onClick={() => setStep("done")}>
                {t("onboarding.payout.skip")}
              </Button>
            </Actions>
          </StepFrame>
        ) : null}

        {step === "done" ? (
          <StepFrame heading={t("onboarding.done.heading")} body={t("onboarding.done.body")}>
            <Actions>
              <ButtonLink href="/studio/overview" iconRight="arrowRight">
                {t("onboarding.done.goOverview")}
              </ButtonLink>
            </Actions>
          </StepFrame>
        ) : null}

        {demo ? <p className="text-[13px] text-silver">{t("demo.writesDisabled")}</p> : null}
      </div>
    </div>
  );
}

function StepFrame({ heading, body, children }: { heading: string; body?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 ref={ref} tabIndex={-1} className="text-xl font-extrabold tracking-tight outline-none md:text-2xl">
          {heading}
        </h2>
        {body ? <p className="leading-relaxed text-silver">{body}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Actions({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-5">{children}</div>;
}

function SlugHint({ status, fallback }: { status: "idle" | "checking" | "available" | "taken" | "invalid"; fallback: string }) {
  const { t } = useI18n();
  const text =
    status === "checking"
      ? t("validation.slugChecking")
      : status === "available"
        ? t("validation.slugAvailable")
        : status === "taken"
          ? t("validation.slugTaken")
          : status === "invalid"
            ? t("validation.slugFormat")
            : fallback;
  return <span aria-live="polite">{text}</span>;
}

export function SpecialtiesField({
  categories,
  value,
  onChange,
  error,
}: {
  categories: OnboardingCategory[];
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
}) {
  const { t } = useI18n();
  const labelId = useId();
  const hintId = useId();
  const options = useMemo(() => categories.map((c) => ({ value: c.id, label: c.label, icon: c.icon })), [categories]);
  return (
    <div className="flex flex-col gap-2">
      <span id={labelId} className="text-sm font-semibold">
        {t("onboarding.identity.specialties")}
      </span>
      <ChipSelect options={options} value={value} onChange={onChange} max={6} labelledBy={labelId} describedBy={hintId} invalid={Boolean(error)} />
      {error ? (
        <p id={hintId} role="alert" className="flex items-center gap-1.5 text-[13px] text-cloud">
          <Icon name="error" size={16} />
          {error}
        </p>
      ) : (
        <p id={hintId} className="text-[13px] text-silver">
          {t("onboarding.identity.specialtiesHint")}
        </p>
      )}
    </div>
  );
}

function PolicyStep({
  doc,
  heading,
  body,
  checkboxLabel,
  acceptLabel,
  pending,
  canAccept,
  locale,
  onAccept,
  onNext,
}: {
  doc: OnboardingPolicy;
  heading: string;
  body: string;
  checkboxLabel: string;
  acceptLabel: string;
  pending: boolean;
  canAccept: boolean;
  locale: "id" | "en";
  onAccept: () => void;
  onNext: () => void;
}) {
  const { t } = useI18n();
  const [checked, setChecked] = useState(false);
  const [showError, setShowError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const bodyId = useId();

  if (!doc) {
    return (
      <StepFrame heading={heading}>
        <p role="alert" className="flex items-start gap-2 rounded-[10px] bg-graphite px-3 py-2.5 text-sm text-cloud shadow-[inset_3px_0_0_#f4f5f7]">
          <Icon name="error" size={16} className="mt-0.5 shrink-0" />
          {t("errors.loadFailed")}
        </p>
        <Actions>
          <Button variant="secondary" icon="refund" onClick={() => window.location.reload()}>
            {t("common.retry")}
          </Button>
        </Actions>
      </StepFrame>
    );
  }
  return (
    <StepFrame heading={heading} body={body}>
      <Panel className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold">{doc.title}</p>
          <span className="font-mono text-xs text-silver">
            {t("common.version")} {doc.version}
          </span>
        </div>
        <ul className="flex flex-col gap-3">
          {doc.summary.map((line) => (
            <li key={line} className="flex items-start gap-2.5 text-sm leading-relaxed text-cloud">
              <Icon name="check" size={16} className="mt-0.5 text-mint" />
              {line}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={bodyId}
          className="flex items-center gap-1.5 self-start text-sm font-semibold text-cloud underline decoration-line-strong underline-offset-4 hover:decoration-mint"
        >
          <Icon name={expanded ? "chevronUp" : "chevronDown"} size={16} />
          {expanded ? t("common.hideFull") : t("common.readFull")}
        </button>
        <div id={bodyId} hidden={!expanded} className="scrollbar-quiet max-h-96 overflow-y-auto rounded-[10px] border border-line bg-obsidian p-4">
          <PolicyBody text={doc.body} />
        </div>
      </Panel>

      {doc.acceptedAt ? (
        <p className="flex items-center gap-2 text-sm font-semibold text-mint">
          <Icon name="success" size={18} />
          {t("onboarding.agreement.accepted", { date: formatDate(doc.acceptedAt, locale, true) })}
        </p>
      ) : (
        <Checkbox
          label={checkboxLabel}
          checked={checked}
          disabled={!canAccept}
          aria-invalid={showError && !checked ? true : undefined}
          onChange={(e) => {
            setChecked(e.target.checked);
            setShowError(false);
          }}
        />
      )}
      {showError && !checked ? (
        <p role="alert" className="flex items-center gap-1.5 text-[13px] text-cloud">
          <Icon name="error" size={16} />
          {t("validation.mustAccept")}
        </p>
      ) : null}
      {!canAccept ? <p className="text-sm text-silver">{t("errors.forbidden", { role: t("roles.admin") })}</p> : null}

      <Actions>
        {doc.acceptedAt ? (
          <Button iconRight="arrowRight" onClick={onNext}>
            {t("common.continue")}
          </Button>
        ) : (
          <Button
            loading={pending}
            disabled={!canAccept}
            iconRight="arrowRight"
            onClick={() => {
              if (!checked) {
                setShowError(true);
                return;
              }
              onAccept();
            }}
          >
            {acceptLabel}
          </Button>
        )}
      </Actions>
    </StepFrame>
  );
}
