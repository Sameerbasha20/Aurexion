import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, Plus, LifeBuoy } from "lucide-react";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Label } from "../../../../components/ui/label";
import { getErrorMessage } from "../../../portal/components/StateViews";
import type { TicketCategory, TicketPriority } from "../../../portal/types/portal.types";
import supportService from "../../services/supportService";

const CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: "general", label: "General Inquiry" },
  { value: "bug", label: "Bug Report" },
  { value: "enhancement", label: "Enhancement" },
  { value: "security", label: "Security Incident" },
  { value: "infrastructure", label: "Infrastructure Issue" },
];

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium (Standard)" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical (Urgent)" },
];

export const CreateTicket: React.FC = () => {
  const [, setLocation] = useLocation();

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<TicketCategory>("general");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      await supportService.createMyTicket({
        subject: subject.trim(),
        category,
        priority,
      });
      setSubmitted(true);
      window.setTimeout(() => setLocation("/support/tickets"), 1200);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <Link href="/support/tickets">
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#63f5e8", fontSize: "0.85rem", cursor: "pointer" }}>
            <ArrowLeft size={14} />
            Back to tickets queue
          </span>
        </Link>
      </div>

      <div>
        <p className="eyebrow" style={{ color: "#63f5e8", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <LifeBuoy size={14} /> TICKET CREATION
        </p>
        <h1 style={{ fontSize: "2rem", margin: "0.25rem 0 0 0", fontFamily: "var(--font-display)", fontWeight: 600 }}>
          Create Operational Support Ticket
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: "0.25rem 0 0 0" }}>
          Log an internal diagnostic payload or support request into the enterprise queue.
        </p>
      </div>

      {submitted ? (
        <Card glowOnHover>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#4ade80" }}>
              <CheckCircle2 size={20} />
              <span style={{ fontWeight: 600 }}>Ticket created successfully</span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0 }}>
              The ticket has been logged. Redirecting to tickets queue...
            </p>
            <Link href="/support/tickets">
              <Button variant="outline" size="sm">
                View tickets queue
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card glowOnHover>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {error && (
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
                {getErrorMessage(error)}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <Label htmlFor="ticket-subject" style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b" }}>
                SUBJECT *
              </Label>
              <Input
                id="ticket-subject"
                value={subject}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
                maxLength={255}
                placeholder="Operational inquiry or system issue summary"
                required
              />
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
            </div>

            <Button type="submit" glow style={{ alignSelf: "flex-start" }} disabled={loading || submitted}>
              <Plus size={14} />
              {loading ? "Creating Ticket..." : "Create Ticket"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};

export default CreateTicket;
