import React from "react";
import { Link } from "wouter";
import { SEO } from "../../../../components/seo/SEO";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="bg-background min-h-[80vh] flex items-center justify-center">
      <SEO
        title="404: Page Not Found | Aurexion"
        description="The requested page or route could not be found."
        noindex={true}
        nofollow={true}
      />
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-primary mb-6">404</h1>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">System Not Found</h2>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto mb-10">
          The requested architecture or route does not exist within the current environment. 
        </p>
        <Link href="/" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          Return to Core
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
