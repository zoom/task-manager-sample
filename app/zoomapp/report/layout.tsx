// app/report/layout.tsx
export default function ReportsLayout({ children }: { children: React.ReactNode }) {
    return (
      <section className="p-8 bg-white dark:bg-gray-900 min-h-screen">
        {/* Custom header or breadcrumb */}
        {children}
      </section>
    );
  }
  