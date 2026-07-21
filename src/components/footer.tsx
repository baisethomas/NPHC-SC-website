export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-sm">&copy; {currentYear} NPHC of Solano County. All Rights Reserved.</p>
          </div>
          {/* Social media links removed until real profiles are configured.
              They will return via site settings in Phase 2 of the CMS roadmap. */}
        </div>
      </div>
    </footer>
  );
}
