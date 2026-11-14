"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/icon";
import { CreatorProfile, type CreatorProfileData } from "@/components/storefront/creator-profile";
import { ImageCropper, type CropKind } from "@/components/storefront/image-cropper";
import { SpecialtiesField, type OnboardingCategory } from "@/app/studio/onboarding/onboarding-flow";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Panel, PanelHeader } from "@/components/ui/misc";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/i18n/client";
import type { MessageKey } from "@/i18n/core";
import type { ActionResult, FieldError } from "@/lib/errors";
import { SOCIAL_KEYS, type SocialKey, type SocialLinks } from "@/lib/validation/merchant";
import type { VerificationState } from "@/components/ui/status-badge";
import { removeMerchantImageAction, updateStorefrontAction, uploadMerchantImageAction } from "./actions";

type FormState = {
  storeName: string;
  tagline: string;
  bio: string;
  pinnedAnnouncement: string;
  specialties: string[];
  socialLinks: Record<SocialKey, string>;
};

const SOCIAL_META: Record<SocialKey, { label: string; icon: IconName; placeholder: string }> = {
  website: { label: "Website", icon: "globe", placeholder: "https://" },
  instagram: { label: "Instagram", icon: "instagram", placeholder: "https://instagram.com/…" },
  tiktok: { label: "TikTok", icon: "tiktok", placeholder: "https://tiktok.com/@…" },
  youtube: { label: "YouTube", icon: "youtube", placeholder: "https://youtube.com/@…" },
  x: { label: "X", icon: "x", placeholder: "https://x.com/…" },
  discord: { label: "Discord", icon: "discord", placeholder: "https://discord.gg/…" },
  github: { label: "GitHub", icon: "github", placeholder: "https://github.com/…" },
  facebook: { label: "Facebook", icon: "facebook", placeholder: "https://facebook.com/…" },
};

function toForm(v: { storeName: string; tagline: string | null; bio: string | null; pinnedAnnouncement: string | null; specialties: string[]; socialLinks: SocialLinks }): FormState {
  return {
    storeName: v.storeName,
    tagline: v.tagline ?? "",
    bio: v.bio ?? "",
    pinnedAnnouncement: v.pinnedAnnouncement ?? "",
    specialties: v.specialties,
    socialLinks: Object.fromEntries(SOCIAL_KEYS.map((k) => [k, v.socialLinks[k] ?? ""])) as Record<SocialKey, string>,
  };
}

export function StorefrontEditor({
  demo,
  canEdit,
  merchantId,
  slug,
  verificationState,
  joinedAt,
  isPublic,
  initial,
  avatarUrl: initialAvatar,
  bannerUrl: initialBanner,
  categories,
}: {
  demo: boolean;
  canEdit: boolean;
  merchantId: string;
  slug: string;
  verificationState: VerificationState;
  joinedAt: string;
  isPublic: boolean;
  initial: { storeName: string; tagline: string | null; bio: string | null; pinnedAnnouncement: string | null; specialties: string[]; socialLinks: SocialLinks };
  avatarUrl: string | null;
  bannerUrl: string | null;
  categories: OnboardingCategory[];
}) {
  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const draftKey = `kamy:storefront-draft:${merchantId}`;

  const saved = useMemo(() => toForm(initial), [initial]);
  // Client-only component: restore an unsaved local draft (refresh, closed tab, lost connection).
  const [initialDraft] = useState<FormState | null>(() => {
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) return null;
      const draft = JSON.parse(raw) as FormState;
      return JSON.stringify(draft) !== JSON.stringify(saved)
        ? { ...saved, ...draft, socialLinks: { ...saved.socialLinks, ...draft.socialLinks } }
        : null;
    } catch {
      return null;
    }
  });
  const [form, setForm] = useState<FormState>(initialDraft ?? saved);
  const [baseline, setBaseline] = useState<FormState>(saved);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);
  const [bannerUrl, setBannerUrl] = useState(initialBanner);
  const [fieldErrors, setFieldErrors] = useState<Record<string, FieldError>>({});
  const [formError, setFormError] = useState<{ key: MessageKey; vars?: Record<string, string | number> } | null>(null);
  const [view, setView] = useState<"form" | "preview">("form");
  const [restored, setRestored] = useState(Boolean(initialDraft));
  const [lastSaved, setLastSaved] = useState<"idle" | "saved">("idle");

  const dirty = JSON.stringify(form) !== JSON.stringify(baseline);

  useEffect(() => {
    try {
      if (dirty) window.localStorage.setItem(draftKey, JSON.stringify(form));
      else window.localStorage.removeItem(draftKey);
    } catch {
      /* storage unavailable */
    }
  }, [form, dirty, draftKey]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setLastSaved("idle");
  };

  const fe = (name: string) => (fieldErrors[name] ? t(fieldErrors[name].key, fieldErrors[name].vars) : undefined);

  const showResultError = (result: Extract<ActionResult, { ok: false }>) => {
    setFieldErrors(result.fieldErrors ?? {});
    const hasFieldErrors = result.fieldErrors && Object.keys(result.fieldErrors).length > 0;
    setFormError(hasFieldErrors ? null : { key: result.error, vars: result.vars });
    toast.show(result.error === "demo.writesDisabled" ? t("demo.writesDisabled") : t(result.error, result.vars), {
      tone: result.error === "demo.writesDisabled" ? "info" : "error",
    });
  };

  const save = () => {
    startTransition(async () => {
      const result = await updateStorefrontAction(form);
      if (!result.ok) return showResultError(result);
      setFieldErrors({});
      setFormError(null);
      setBaseline(form);
      setRestored(false);
      setLastSaved("saved");
      toast.show(t("storefront.saved"), { sound: "success" });
      router.refresh();
    });
  };

  // ---- Images ----
  const [cropKind, setCropKind] = useState<CropKind>("avatar");
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputs = { avatar: useRef<HTMLInputElement>(null), banner: useRef<HTMLInputElement>(null) };

  const pickFile = (kind: CropKind, file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      toast.show(t("errors.uploadType"), { tone: "error" });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.show(t("errors.uploadSize", { size: `${(file.size / 1048576).toFixed(1)} MB`, max: "8 MB" }), { tone: "error" });
      return;
    }
    setCropKind(kind);
    setCropFile(file);
  };

  const uploadCropped = async (blob: Blob) => {
    setUploading(true);
    try {
      const data = new FormData();
      data.set("kind", cropKind);
      data.set("file", new File([blob], `${cropKind}.${blob.type.split("/")[1] ?? "webp"}`, { type: blob.type }));
      const result = await uploadMerchantImageAction(data);
      if (!result.ok) return showResultError(result);
      if (cropKind === "avatar") setAvatarUrl(result.data.url);
      else setBannerUrl(result.data.url);
      setCropFile(null);
      toast.show(t("storefront.saved"), { sound: "success" });
      router.refresh();
    } catch {
      toast.show(t("errors.uploadFailed"), { tone: "error" });
    } finally {
      setUploading(false);
      if (fileInputs[cropKind].current) fileInputs[cropKind].current.value = "";
    }
  };

  const removeImage = (kind: CropKind) => {
    startTransition(async () => {
      const result = await removeMerchantImageAction(kind);
      if (!result.ok) return showResultError(result);
      if (kind === "avatar") setAvatarUrl(null);
      else setBannerUrl(null);
      router.refresh();
    });
  };

  const preview: CreatorProfileData = {
    storeName: form.storeName,
    slug,
    tagline: form.tagline || null,
    bio: form.bio || null,
    avatarUrl,
    bannerUrl,
    specialties: form.specialties.map((id) => categories.find((c) => c.id === id)).filter(Boolean).map((c) => ({ id: c!.id, label: c!.label, icon: c!.icon })),
    socialLinks: Object.fromEntries(Object.entries(form.socialLinks).filter(([, v]) => v)) as SocialLinks,
    pinnedAnnouncement: form.pinnedAnnouncement || null,
    verificationState,
    joinedAt,
  };

  const imageRow = (kind: CropKind, url: string | null): ReactNode => (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden border border-line bg-graphite text-silver",
          kind === "avatar" ? "size-16 rounded-full" : "h-16 w-32 rounded-[10px]",
        )}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- public storage thumbnail
          <img src={url} alt="" className="size-full object-cover" />
        ) : (
          <Icon name="image" size={20} />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-sm font-semibold">{t(kind === "avatar" ? "storefront.avatar" : "storefront.banner")}</p>
        <p className="text-[13px] leading-snug text-silver">{t(kind === "avatar" ? "storefront.avatarHint" : "storefront.bannerHint")}</p>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputs[kind]}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => pickFile(kind, e.target.files?.[0])}
          />
          <Button size="sm" variant="secondary" icon="upload" disabled={!canEdit} onClick={() => fileInputs[kind].current?.click()}>
            {url ? t("storefront.replace") : t("storefront.upload")}
          </Button>
          {url ? (
            <Button size="sm" variant="ghost" icon="delete" disabled={!canEdit || pending} onClick={() => removeImage(kind)}>
              {t("storefront.removeImage")}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="md:hidden">
          <Tabs
            label={t("common.preview")}
            value={view}
            onChange={(v) => setView(v as "form" | "preview")}
            items={[
              { id: "form", label: t("common.form") },
              { id: "preview", label: t("common.preview") },
            ]}
          />
        </div>
        <SaveStatus dirty={dirty} saving={pending} saved={lastSaved === "saved"} restored={restored} />
      </div>

      {!isPublic ? (
        <p className="flex items-start gap-2 rounded-[12px] border border-line-strong px-4 py-3 text-sm text-cloud">
          <Icon name="info" size={18} className="mt-px text-silver" />
          {t("storefront.notPublicYet")}
        </p>
      ) : null}
      {!canEdit ? (
        <p className="flex items-start gap-2 rounded-[12px] bg-graphite px-4 py-3 text-sm text-cloud shadow-[inset_3px_0_0_#f4f5f7]">
          <Icon name="lock" size={18} className="mt-px" />
          {t("errors.forbidden", { role: t("roles.admin") })}
        </p>
      ) : null}
      {formError ? (
        <p role="alert" className="flex items-start gap-2 rounded-[12px] bg-graphite px-4 py-3 text-sm text-cloud shadow-[inset_3px_0_0_#f4f5f7]">
          <Icon name="error" size={18} className="mt-px" />
          {t(formError.key, formError.vars)}
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <form
          className={cn("flex min-w-0 flex-col gap-6", view === "preview" && "hidden md:flex")}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <fieldset disabled={!canEdit} className="flex flex-col gap-6">
            <Panel>
              <PanelHeader title={t("storefront.sections.images")} />
              <div className="flex flex-col gap-5 p-5">
                {imageRow("avatar", avatarUrl)}
                {imageRow("banner", bannerUrl)}
              </div>
            </Panel>

            <Panel>
              <PanelHeader title={t("storefront.sections.about")} />
              <div className="flex flex-col gap-5 p-5">
                <Field label={t("onboarding.identity.storeName")} required error={fe("storeName")} counter={{ count: form.storeName.length, max: 60 }}>
                  {(c) => <Input {...c} value={form.storeName} maxLength={60} onChange={(e) => set("storeName", e.target.value)} />}
                </Field>
                <Field label={t("onboarding.identity.tagline")} hint={t("onboarding.identity.taglineHint")} optional error={fe("tagline")} counter={{ count: form.tagline.length, max: 120 }}>
                  {(c) => <Input {...c} value={form.tagline} maxLength={120} onChange={(e) => set("tagline", e.target.value)} />}
                </Field>
                <Field label={t("storefront.bio")} hint={t("storefront.bioHint")} optional error={fe("bio")} counter={{ count: form.bio.length, max: 1200 }}>
                  {(c) => <Textarea {...c} rows={6} value={form.bio} maxLength={1200} onChange={(e) => set("bio", e.target.value)} />}
                </Field>
                <Field
                  label={t("storefront.announcement")}
                  hint={t("storefront.announcementHint")}
                  optional
                  error={fe("pinnedAnnouncement")}
                  counter={{ count: form.pinnedAnnouncement.length, max: 200 }}
                >
                  {(c) => <Input {...c} value={form.pinnedAnnouncement} maxLength={200} onChange={(e) => set("pinnedAnnouncement", e.target.value)} />}
                </Field>
              </div>
            </Panel>

            <Panel>
              <PanelHeader title={t("storefront.sections.specialties")} />
              <div className="p-5">
                <SpecialtiesField categories={categories} value={form.specialties} onChange={(v) => set("specialties", v)} error={fe("specialties")} />
              </div>
            </Panel>

            <Panel>
              <PanelHeader title={t("storefront.sections.links")} description={t("storefront.socialHint")} />
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                {SOCIAL_KEYS.map((key) => (
                  <Field key={key} label={<span className="inline-flex items-center gap-2"><Icon name={SOCIAL_META[key].icon} size={15} className="text-silver" />{SOCIAL_META[key].label}</span>} error={fe(`social.${key}`)}>
                    {(c) => (
                      <Input
                        {...c}
                        type="url"
                        inputMode="url"
                        spellCheck={false}
                        placeholder={SOCIAL_META[key].placeholder}
                        value={form.socialLinks[key]}
                        maxLength={300}
                        onChange={(e) => set("socialLinks", { ...form.socialLinks, [key]: e.target.value })}
                      />
                    )}
                  </Field>
                ))}
              </div>
            </Panel>

            <Panel>
              <PanelHeader title={t("storefront.featured")} />
              <p className="px-5 py-4 text-sm text-silver">{t("storefront.featuredEmpty")}</p>
            </Panel>
          </fieldset>

          <div className={cn("z-20 flex items-center justify-end gap-2 rounded-[14px] border border-line bg-obsidian/95 p-3 backdrop-blur", dirty && "sticky bottom-20 md:bottom-4")}>
            <Button
              variant="ghost"
              disabled={!dirty || pending}
              onClick={() => {
                setForm(baseline);
                setFieldErrors({});
                setFormError(null);
                setRestored(false);
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" icon="save" loading={pending} disabled={!canEdit || !dirty}>
              {t("common.saveChanges")}
            </Button>
          </div>
        </form>

        <div className={cn("min-w-0", view === "form" && "hidden md:block")}>
          <div className="lg:sticky lg:top-24">
            <div className="mb-3 flex items-center justify-between">
              <p className="label-mono">{t("common.preview")}</p>
              {demo ? null : isPublic ? (
                <a href={`/c/${slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-silver hover:text-cloud">
                  {t("common.viewPublicPage")}
                  <Icon name="externalLink" size={14} />
                </a>
              ) : null}
            </div>
            <div className="scrollbar-quiet max-h-[calc(100dvh-9rem)] overflow-y-auto rounded-[20px] border border-line bg-obsidian p-4 md:p-5">
              <CreatorProfile data={preview} demo={demo} preview />
            </div>
          </div>
        </div>
      </div>

      <ImageCropper kind={cropKind} file={cropFile} busy={uploading} onCancel={() => !uploading && setCropFile(null)} onApply={uploadCropped} />
    </div>
  );
}

function SaveStatus({ dirty, saving, saved, restored }: { dirty: boolean; saving: boolean; saved: boolean; restored: boolean }) {
  const { t } = useI18n();
  const online = useSyncExternalStore(
    (notify) => {
      window.addEventListener("online", notify);
      window.addEventListener("offline", notify);
      return () => {
        window.removeEventListener("online", notify);
        window.removeEventListener("offline", notify);
      };
    },
    () => navigator.onLine,
    () => true,
  );
  let icon: IconName = "success";
  let text = "";
  if (!online) {
    icon = "offline";
    text = t("common.offlineWillRetry");
  } else if (saving) {
    icon = "processing";
    text = t("common.saving");
  } else if (dirty) {
    icon = "edit";
    text = restored ? t("onboarding.draftRestored") : t("common.unsavedChanges");
  } else if (saved) {
    text = t("common.savedJustNow");
  }
  if (!text) return <span />;
  return (
    <p role="status" className="ml-auto flex items-center gap-2 text-[13px] font-semibold text-silver">
      <Icon name={icon} size={15} className={icon === "success" ? "text-mint" : undefined} />
      {text}
    </p>
  );
}
