"use client";

import { useState, type ReactNode } from "react";
import { Icon, ICON_NAMES } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { ChipSelect } from "@/components/ui/chip-select";
import { Checkbox, RadioCard, Toggle } from "@/components/ui/choice";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { DemoLabel, EmptyState, Kbd, Panel, Progress, Skeleton } from "@/components/ui/misc";
import { StatusBadge, VerificationBadge, type ProductStatus } from "@/components/ui/status-badge";
import { Stepper } from "@/components/ui/stepper";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";

const STATUSES: ProductStatus[] = ["draft", "submitted", "in_review", "changes_requested", "approved", "published", "unpublished", "rejected", "suspended"];

const COLORS = [
  { name: "Obsidian", hex: "#090B0F", role: "Canvas" },
  { name: "Graphite", hex: "#202631", role: "Raised surfaces" },
  { name: "Cloud", hex: "#F4F5F7", role: "Primary text" },
  { name: "Neon Mint", hex: "#65E5D0", role: "Primary action, success" },
  { name: "Muted Silver", hex: "#929BA8", role: "Secondary text" },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="label-mono">{title}</h2>
      <Panel className="flex flex-col gap-6 p-6">{children}</Panel>
    </section>
  );
}

export function Gallery() {
  const toast = useToast();
  const [chips, setChips] = useState(["3d"]);
  const [tab, setTab] = useState("30");
  const [step, setStep] = useState("b");
  const [dialog, setDialog] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="flex flex-col gap-10">
      <Section title="Color · 5 tokens only">
        <div className="grid gap-3 sm:grid-cols-5">
          {COLORS.map((c) => (
            <div key={c.hex} className="flex flex-col gap-2">
              <span className="h-16 rounded-[10px] border border-line" style={{ background: c.hex }} />
              <span className="text-sm font-semibold">{c.name}</span>
              <span className="font-mono text-xs text-silver">{c.hex}</span>
              <span className="text-xs text-silver">{c.role}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography · Manrope + IBM Plex Mono">
        <p className="text-[34px] font-extrabold tracking-[-0.03em]">Make digital work discoverable.</p>
        <p className="text-xl font-bold">Section heading · Manrope Bold</p>
        <p className="max-w-xl leading-relaxed text-silver">Body copy in Manrope. Numbers use tabular figures in tables and money: <span className="tabular text-cloud">Rp 1.245.000 · Rp 49.000</span></p>
        <p className="label-mono">SKU-0042 · v1.2.0 · GLB / FBX · section label</p>
      </Section>

      <Section title="Buttons · all states">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary" icon="save">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Delete product</Button>
          <Button loading>Saving</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm" variant="secondary">Small</Button>
          <Button size="lg" iconRight="arrowRight">Large</Button>
          <IconButton icon="edit" label="Edit" />
          <IconButton icon="duplicate" label="Duplicate" />
          <IconButton icon="delete" label="Delete" disabled />
        </div>
      </Section>

      <Section title="Inputs · default, hint, counter, error, disabled, read-only">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Store name" hint="2–60 characters." required counter={{ count: 17, max: 60 }}>
            {(c) => <Input {...c} defaultValue="Nusantara Lowpoly" />}
          </Field>
          <Field label="Store address" error="This address is taken or reserved. Try a variation.">
            {(c) => <Input {...c} defaultValue="kamy" prefix="kamy.id/c/" className="font-mono text-sm [--prefix-w:6.4rem]" />}
          </Field>
          <Field label="Disabled" optional>
            {(c) => <Input {...c} disabled defaultValue="Not editable" />}
          </Field>
          <Field label="Read-only">
            {(c) => <Input {...c} readOnly defaultValue="KMY-10482" className="font-mono text-sm" />}
          </Field>
          <Field label="Category">
            {(c) => (
              <Select {...c} defaultValue="3d">
                <option value="3d">3D & Game</option>
                <option value="ui">UI / UX</option>
              </Select>
            )}
          </Field>
          <Field label="Bio" hint="Plain text.">
            {(c) => <Textarea {...c} rows={3} />}
          </Field>
        </div>
      </Section>

      <Section title="Choices">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Checkbox label="I accept the seller agreement" defaultChecked />
            <Checkbox label="Unchecked with description" description="Helper text under the label." />
            <Checkbox label="Disabled" disabled />
            <Toggle label="Notify previous buyers" description="Sends an update email." defaultChecked />
            <Toggle label="Disabled toggle" disabled />
          </div>
          <fieldset className="flex flex-col gap-3">
            <legend className="sr-only">Account type</legend>
            <RadioCard name="ds-type" icon="user" label="Individual" description="A solo creator." defaultChecked />
            <RadioCard name="ds-type" icon="users" label="Studio or team" description="Several members." />
          </fieldset>
        </div>
        <ChipSelect
          value={chips}
          onChange={setChips}
          max={3}
          options={[
            { value: "3d", label: "3D & Game", icon: "3d" },
            { value: "ui", label: "UI / UX", icon: "uiux" },
            { value: "tpl", label: "Templates", icon: "templates" },
            { value: "gfx", label: "Graphics", icon: "graphics" },
          ]}
        />
      </Section>

      <Section title="Status language · icon + label, never color alone">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <VerificationBadge state="verified" demo={false} />
          <VerificationBadge state="pending" demo={false} />
          <VerificationBadge state="verified" demo />
          <span className="text-xs text-silver">← in demo mode a “verified” state never shows the verified mark</span>
          <DemoLabel>Demo data</DemoLabel>
        </div>
      </Section>

      <Section title="Navigation & progress">
        <Tabs label="Range" value={tab} onChange={setTab} items={[{ id: "7", label: "7 days" }, { id: "30", label: "30 days" }, { id: "90", label: "90 days" }]} />
        <div className="max-w-xs">
          <Stepper
            label="Steps"
            current={step}
            onSelect={setStep}
            steps={[
              { id: "a", label: "Basics", done: true },
              { id: "b", label: "Media", done: false },
              { id: "c", label: "Files", done: false, disabled: true },
            ]}
          />
        </div>
        <Progress value={6} max={8} label="6 of 8 complete" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-80" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Section>

      <Section title="Overlays & feedback">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => setDialog(true)}>Open modal</Button>
          <Button variant="secondary" onClick={() => setSheet(true)}>Open side sheet</Button>
          <Button variant="destructive" onClick={() => setConfirm(true)}>Delete (type to confirm)</Button>
          <Button variant="secondary" onClick={() => toast.show("Storefront saved.")}>Success toast</Button>
          <Button variant="secondary" onClick={() => toast.show("Upload failed. Your original file is unchanged; try again.", { tone: "error" })}>Error toast</Button>
          <Tooltip content="Tooltips appear on hover and focus.">
            {(id) => <Button variant="ghost" aria-describedby={id} icon="info">Tooltip</Button>}
          </Tooltip>
          <span className="flex items-center gap-1">
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </span>
        </div>
        <Panel className="bg-obsidian">
          <EmptyState icon="receipt" title="No orders yet" body="Orders appear here once buyers arrive." action={<Button size="sm" variant="secondary">Learn more</Button>} />
        </Panel>
      </Section>

      <Section title={`Icons · KAMY Icon System v1.0 (${ICON_NAMES.length})`}>
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-8 lg:grid-cols-12">
          {ICON_NAMES.map((name) => (
            <li key={name} className="flex flex-col items-center gap-1.5 rounded-[10px] border border-line p-2.5" title={name}>
              <Icon name={name} size={22} className="text-cloud" />
              <span className="w-full truncate text-center font-mono text-[9px] text-silver">{name}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Dialog
        open={dialog}
        onClose={() => setDialog(false)}
        title="Modal dialog"
        description="Native dialog: focus is contained, Esc closes, focus returns to the trigger."
        footer={<Button onClick={() => setDialog(false)}>Done</Button>}
      >
        <p className="text-sm text-silver">Dialog body.</p>
      </Dialog>
      <Dialog open={sheet} onClose={() => setSheet(false)} title="Side sheet" variant="sheet">
        <p className="text-sm text-silver">Side sheets slide in for secondary tasks.</p>
      </Dialog>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          toast.show("Deleted (example).", { tone: "info" });
        }}
        title="Delete “Rumah Joglo Pack”?"
        description="This removes the draft permanently. Published versions are not affected."
        confirmLabel="Delete product"
        cancelLabel="Cancel"
        confirmText="Rumah Joglo Pack"
        typeToConfirmLabel="Type the product name to confirm"
      />
    </div>
  );
}
