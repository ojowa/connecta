"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, Save, X, GripVertical, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/shared/loading";
import { api } from "@/lib/api";

interface Plan {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  tagline?: string;
  isPopular: boolean;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: string[];
  dailyLikes: number;
  dailySuperLikes: number;
  isActive: boolean;
  sortOrder: number;
}

const emptyPlan: Partial<Plan> = {
  name: "",
  displayName: "",
  description: "",
  tagline: "",
  isPopular: false,
  priceMonthly: 0,
  priceYearly: 0,
  currency: "NGN",
  features: [],
  dailyLikes: 10,
  dailySuperLikes: 1,
  isActive: true,
  sortOrder: 0,
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Partial<Plan> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [message, setMessage] = useState("");
  const [featureInput, setFeatureInput] = useState("");

  useEffect(() => {
    api.get<Plan[]>("/admin/plans").then(setPlans).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setMessage("");
    try {
      if (isNew) {
        const created = await api.post<Plan>("/admin/plans", editing);
        setPlans((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
      } else {
        const updated = await api.put<Plan>(`/admin/plans/${editing.id}`, editing);
        setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      }
      setEditing(null);
      setIsNew(false);
      setMessage("Plan saved successfully.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan: Plan) => {
    if (!confirm(`Delete "${plan.displayName}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/plans/${plan.id}`);
      setPlans((prev) => prev.filter((p) => p.id !== plan.id));
      setMessage("Plan deleted.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const toggleActive = async (plan: Plan) => {
    try {
      const updated = await api.put<Plan>(`/admin/plans/${plan.id}`, { isActive: !plan.isActive });
      setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const addFeature = () => {
    if (!featureInput.trim() || !editing) return;
    setEditing({ ...editing, features: [...(editing.features || []), featureInput.trim()] });
    setFeatureInput("");
  };

  const removeFeature = (index: number) => {
    if (!editing) return;
    setEditing({ ...editing, features: (editing.features || []).filter((_, i) => i !== index) });
  };

  if (loading) return <Loading text="Loading plans..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-muted-foreground">Create and manage subscription plans for your users.</p>
        </div>
        {!editing && (
          <Button onClick={() => { setEditing({ ...emptyPlan }); setIsNew(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Plan
          </Button>
        )}
      </div>

      {message && (
        <div className={`rounded-lg border p-4 text-sm ${message.includes("success") || message.includes("deleted") ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"}`}>
          {message}
        </div>
      )}

      {editing && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{isNew ? "New Plan" : `Edit: ${editing.displayName}`}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => { setEditing(null); setIsNew(false); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Internal Name</Label>
                <Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. premium" />
              </div>
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input value={editing.displayName || ""} onChange={(e) => setEditing({ ...editing, displayName: e.target.value })} placeholder="e.g. Premium" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Short description" />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input value={editing.tagline || ""} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} placeholder="e.g. Find your perfect match" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monthly Price (NGN)</Label>
                <Input type="number" value={editing.priceMonthly || 0} onChange={(e) => setEditing({ ...editing, priceMonthly: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Yearly Price (NGN)</Label>
                <Input type="number" value={editing.priceYearly || 0} onChange={(e) => setEditing({ ...editing, priceYearly: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Daily Likes</Label>
                <Input type="number" value={editing.dailyLikes || 0} onChange={(e) => setEditing({ ...editing, dailyLikes: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Daily Super Likes</Label>
                <Input type="number" value={editing.dailySuperLikes || 0} onChange={(e) => setEditing({ ...editing, dailySuperLikes: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" value={editing.sortOrder || 0} onChange={(e) => setEditing({ ...editing, sortOrder: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!editing.isPopular} onChange={(e) => setEditing({ ...editing, isPopular: e.target.checked })} className="h-4 w-4" />
                <span>Most Popular</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} className="h-4 w-4" />
                <span>Active</span>
              </label>
            </div>
            <div className="space-y-2">
              <Label>Features</Label>
              <div className="flex gap-2">
                <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="Add a feature..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())} />
                <Button type="button" variant="outline" onClick={addFeature}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(editing.features || []).map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                    {f}
                    <button onClick={() => removeFeature(i)} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => { setEditing(null); setIsNew(false); }}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {isNew ? "Create Plan" : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${!plan.isActive ? "opacity-60" : ""}`}>
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground flex items-center gap-1">
                <Star className="h-3 w-3" /> Most Popular
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{plan.displayName}</CardTitle>
                  <CardDescription>{plan.tagline}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(plan); setIsNew(false); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {plan.name !== "free" && (
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(plan)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">₦{Number(plan.priceMonthly).toLocaleString()}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              {plan.priceYearly > 0 && (
                <p className="text-sm text-muted-foreground">
                  ₦{Number(plan.priceYearly).toLocaleString()}/year
                  {plan.priceMonthly > 0 && (
                    <span className="text-green-600 ml-2">
                      Save {Math.round((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100)}%
                    </span>
                  )}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {plan.features.map((f, i) => (
                  <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-xs">{f}</span>
                ))}
              </div>
              <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
                <span>{plan.dailyLikes === 999 ? "Unlimited" : plan.dailyLikes} likes/day</span>
                <span>{plan.dailySuperLikes === 999 ? "Unlimited" : plan.dailySuperLikes} super likes/day</span>
                <button onClick={() => toggleActive(plan)} className={`ml-auto font-medium ${plan.isActive ? "text-green-600" : "text-red-600"}`}>
                  {plan.isActive ? "Active" : "Inactive"}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
