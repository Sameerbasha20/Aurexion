import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2 } from "lucide-react";
import Button from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const nameRegex = /^[a-zA-Z\s'-]+$/;

const leadSchema = z.object({
  name: z
    .string()
    .min(1, "Lead name is required.")
    .min(2, "Lead name must be at least 2 characters.")
    .regex(nameRegex, "Please enter a valid name format (letters, spaces, hyphens, and apostrophes only)"),
  email: z.string().email("Please enter a valid email address."),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{10}$/.test(val), "Phone number must be exactly 10 digits (numbers only)."),
  company: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  source: z.string().optional(),
  priority: z.string().optional(),
  description: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadSchema>;

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: LeadFormValues) => Promise<void>;
  isLoading?: boolean;
  serverErrors?: Record<string, string[] | string> | null;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  serverErrors,
}) => {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      website: "",
      industry: "",
      source: "WEBSITE",
      priority: "MEDIUM",
      description: "",
    },
  });

  useEffect(() => {
    if (serverErrors) {
      Object.entries(serverErrors).forEach(([field, msg]) => {
        const message = Array.isArray(msg) ? msg.join(", ") : String(msg);
        setError(field as any, { type: "server", message });
      });
    }
  }, [serverErrors, setError]);

  if (!isOpen) return null;

  const handleFormSubmit: SubmitHandler<LeadFormValues> = async (data) => {
    await onSubmit(data);
    reset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-slate-100">Establish New Lead</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <Label htmlFor="name" className="text-slate-300 font-medium">
              Lead Name <span className="text-cyan-400">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              className={`mt-1 bg-slate-950 border-slate-800 text-slate-100 ${
                errors.name ? "border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="email" className="text-slate-300 font-medium">
              Email Address <span className="text-cyan-400">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className={`mt-1 bg-slate-950 border-slate-800 text-slate-100 ${
                errors.email ? "border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone" className="text-slate-300">
                Phone Number
              </Label>
              <Input
                id="phone"
                {...register("phone")}
                className="mt-1 bg-slate-950 border-slate-800 text-slate-100"
              />
            </div>
            <div>
              <Label htmlFor="company" className="text-slate-300">
                Company Name
              </Label>
              <Input
                id="company"
                {...register("company")}
                className="mt-1 bg-slate-950 border-slate-800 text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="source" className="text-slate-300">
                Lead Source
              </Label>
              <select
                id="source"
                {...register("source")}
                className="mt-1 w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="WEBSITE">Website Contact</option>
                <option value="ESTIMATOR">RFP Estimator</option>
                <option value="LINKEDIN">LinkedIn / Social</option>
                <option value="REFERRAL">Client Referral</option>
                <option value="COLD_OUTREACH">Cold Outreach</option>
              </select>
            </div>
            <div>
              <Label htmlFor="priority" className="text-slate-300">
                Priority Level
              </Label>
              <select
                id="priority"
                {...register("priority")}
                className="mt-1 w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-slate-300">
              Requirements & Notes
            </Label>
            <textarea
              id="description"
              {...register("description")}
              rows={3}
              className="mt-1 w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-medium min-w-[120px]"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save Lead"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadFormModal;
