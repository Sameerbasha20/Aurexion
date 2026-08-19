import React from "react";
import { useParams, Link } from "wouter";
import { useJobDetails } from "../../hooks/usePublicContent";
import { ArrowLeft, Loader2, AlertCircle, MapPin, Clock, Briefcase } from "lucide-react";

export const JobDetailsPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";
  const { data: job, loading, error } = useJobDetails(id);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
        <p className="text-muted-foreground mb-6">We couldn't find the position you're looking for.</p>
        <Link href="/careers" className="text-primary hover:underline flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Careers
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background pt-24 pb-24">
      <header className="border-b border-border/40 bg-card/20 pt-8 pb-12 mb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/careers" className="inline-flex items-center text-sm font-mono text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> BACK TO ALL OPENINGS
          </Link>
          <div className="max-w-4xl">
            <h1 
              style={{ 
                fontSize: "clamp(2rem, 3.5vw, 2.75rem)", 
                lineHeight: "1.2", 
                fontWeight: 700, 
                letterSpacing: "-0.02em", 
                margin: "0.5rem 0 1.25rem",
                color: "#f8fafc",
                maxWidth: "100%"
              }}
            >
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center font-mono text-primary"><Briefcase className="mr-2 h-4 w-4" /> {job.department}</span>
              <span className="flex items-center"><MapPin className="mr-2 h-4 w-4" /> {job.location}</span>
              {job.employmentType && <span className="flex items-center"><Clock className="mr-2 h-4 w-4" /> {job.employmentType}</span>}
              {job.experience && <span className="flex items-center border border-border/60 px-2 py-0.5 rounded">{job.experience}</span>}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-16">
          <div className="md:col-span-2">
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">About the Role</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </section>

            {job.responsibilities && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">What You'll Do</h2>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {job.responsibilities}
                </div>
              </section>
            )}




            {job.skills && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Skills</h2>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {job.skills}
                </div>
              </section>
            )}
          </div>

          <div className="md:col-span-1">
            <div className="sticky top-24 p-8 border border-border/40 bg-card rounded-lg">
              <h3 className="text-xl font-bold mb-4">Apply for this Position</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Join our team and help us build what comes next.
              </p>
              <Link href={`/careers/${job.job_id}/apply`} className="flex w-full h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors mb-3">
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
