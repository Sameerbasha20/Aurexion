import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, Plus } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Label } from "../../../../components/ui/label";
import Card from "../../../../components/ui/card";
import PageHeader from "../../components/PageHeader";
import { getErrorMessage } from "../../components/StateViews";
import type { TicketCategory, TicketPriority } from "../../types/portal.types";
import useCreateTicket from "../../hooks/useCreateTicket";

const CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: "general", label: "General Inquiry" },
  { value: "bug", label: "Bug Report" },
  { value: "enhancement", label: "Feature Request / Enhancement" },
  { value: "security", label: "Security Incident" },
  { value: "infrastructure", label: "Infrastructure / Server Issue" },
];

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium (Standard)" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical (Urgent)" },
];

export const CreateTicket: React.FC = () => {
  const create = useCreateTicket();
  const [, setLocation] = useLocation();

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<TicketCategory>("general");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (create.isLoading || submitted) return;

    const nextErrors: Record<string, string> = {};
    if (!subject.trim()) nextErrors.subject = "Subject is required.";
    if (!category) nextErrors.category = "Category is required.";
    if (!priority) nextErrors.priority = "Priority is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await create.create({
        subject: subject.trim(),
        category,
        priority,
      });
      setSubmitted(true);
      window.setTimeout(() => setLocation("/portal/support/tickets"), 1200);
    } catch {
      // Error surfaced through create.error
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <Link href="/portal/support/tickets">
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#63f5e8", fontSize: "0.85rem", cursor: "pointer" }}>
            <ArrowLeft size={14} />
            Back to tickets
          </span>
        </Link>
      </div>

      <PageHeader
        eyebrow="CLIENT SUPPORT"
        title="Create Support Ticket"
        description="Submit a support request to the Aurexion technical engineering team. We will process your ticket promptly."
      />

      {submitted ? (
        <Card glowOnHover>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#4ade80" }}>
              <CheckCircle2 size={20} />
              <span style={{ fontWeight: 600 }}>Ticket submitted successfully</span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0 }}>
              Your support ticket has been created and assigned to the queue. Redirecting to your tickets...
            </p>
            <Link href="/portal/support/tickets">
              <Button variant="outline" size="sm">
                View my tickets
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {create.error && (
              <div
                style={{
                  color: "#f87171",
                  backgroundColor: "rgba(248,113,113,0.08)",
                  border: "1px solid rgba(248,113,113,0.2)",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                }}
              >
                {getErrorMessage(create.error)}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <Label htmlFor="ticket-subject" style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b" }}>
                SUBJECT *
              </Label>
              <Input
                id="ticket-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={255}
                placeholder="Brief summary of the issue or request"
                aria-invalid={!!errors.subject}
              />
              {errors.subject && <span style={{ color: "#f87171", fontSize: "0.78rem" }}>{errors.subject}</span>}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <Label style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b" }}>
                CATEGORY *
              </Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
                <SelectTrigger style={{ width: "100%" }}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <span style={{ color: "#f87171", fontSize: "0.78rem" }}>{errors.category}</span>}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <Label style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b" }}>
                PRIORITY *
              </Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                <SelectTrigger style={{ width: "100%" }}>
                  <SelectValue placeholder="Select a priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && <span style={{ color: "#f87171", fontSize: "0.78rem" }}>{errors.priority}</span>}
            </div>

            <Button type="submit" glow style={{ alignSelf: "flex-start" }} disabled={create.isLoading || submitted}>
              <Plus size={14} />
              {create.isLoading ? "Submitting Ticket..." : "Submit Ticket"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};

export default CreateTicket;