import Footer from "./footer";
import Navbar from "./navbar";

type ContentLayoutProps = {
  children: React.ReactNode;
};

export const ContentLayout = ({ children }: ContentLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
};
