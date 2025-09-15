
// Layout.jsx

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User, Subscription, Bill, IncomeSource, LoggedIncome } from "@/api/entities";
import {
  LayoutDashboard,
  CreditCard,
  Receipt,
  User as UserIcon,
  LogOut,
  Bot,
  Settings,
  Landmark,
  Plus,
  DollarSign,
  Menu,
  StickyNote,
  Calculator,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, parseISO, add } from "date-fns";

import LogIncomeForm from "../components/income/LogIncomeForm";
import BillForm from "../components/bills/BillForm";
import SubscriptionForm from "../components/subscriptions/SubscriptionForm";

/* =========================
   Navigation config
   ========================= */
const mainNavItems = [
  { title: "Dashboard", url: createPageUrl("dashboard"), icon: LayoutDashboard, gradient: "from-purple-400 to-pink-400" },
  { title: "Income", url: createPageUrl("income"), icon: Landmark, gradient: "from-green-400 to-lime-400" },
  { title: "Bills", url: createPageUrl("bills"), icon: Receipt, gradient: "from-emerald-400 to-teal-400" },
  { title: "Subscriptions", url: createPageUrl("subscriptions"), icon: CreditCard, gradient: "from-blue-400 to-cyan-400" },
  { title: "Budgets", url: createPageUrl("budgets"), icon: Calculator, gradient: "from-emerald-500 to-green-500" }
];

const adminNavItems = [
  { title: "Sticky Notes", url: createPageUrl("stickynotes"), icon: StickyNote, gradient: "from-yellow-400 to-amber-400" },
  { title: "Rollout Manager", url: createPageUrl("assistant"), icon: Bot, gradient: "from-violet-400 to-purple-400" }
];

/* =========================
   Presentational pieces
   ========================= */
function NavItem({ item, isActive }) {
  return (
    <Link
      to={item.url}
      className={[
        "p-2 relative group block rounded-xl transition-all duration-300 text-center",
        "border border-white/10 glass-light hover:glass-hover"
      ].join(" ")}
    >
      <div className="flex items-center justify-center gap-3 py-1">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${item.gradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
          <item.icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-glass font-medium text-base whitespace-nowrap">{item.title}</span>
      </div>
      {isActive ? <div className="absolute inset-x-2 -bottom-1 h-0.5 rounded bg-white/30" /> : null}
    </Link>
  );
}

function OldBackground() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-teal-600 via-blue-700 via-purple-800 to-pink-900">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 via-transparent to-magenta-500/30" />
      <div className="absolute inset-0 bg-gradient-to-bl from-lime-400/20 via-transparent to-orchid-500/20" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-teal-400/40 to-cyan-400/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-l from-pink-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-t from-lime-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "4s" }} />
    </div>
  );
}


function ThemeToggle({ isDark, onToggle }) {
  return (
    <button onClick={onToggle} className="block" title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
        <div className="p-2 sm:p-3 rounded-full glass-light">
          {isDark ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
        </div>
        <span className="text-xs text-glass-muted hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
      </div>
    </button>
  );
}

function SideNavigation() {
  const location = useLocation();
  const [userRole, setUserRole] = React.useState("user");

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUserRole(currentUser.role || "user");
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <nav className="space-y-3 flex-1">
        {mainNavItems.map((item) => (
          <NavItem key={item.title} item={item} isActive={location.pathname === item.url} />
        ))}

        {userRole === "admin" && (
          <>
            <div className="py-2"><div className="border-t border-white/20" /></div>
            {adminNavItems.map((item) => (
              <NavItem key={item.title} item={item} isActive={location.pathname === item.url} />
            ))}
          </>
        )}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/20 space-y-2 flex-shrink-0">
        <Link to={createPageUrl("settings")} className="block">
          <div className="px-4 py-2 group relative rounded-2xl transition-all duration-300 border border-transparent glass-light hover:glass-hover">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-500 shadow-xl flex-shrink-0">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span className="text-glass font-medium text-base">Settings</span>
            </div>
          </div>
        </Link>

        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start px-4 py-2 rounded-2xl border border-transparent glass-light hover:glass-hover transition-all duration-300 text-glass h-auto"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 shadow-xl flex-shrink-0">
              <LogOut className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-base">Log Out</span>
          </div>
        </Button>
      </div>
    </div>
  );
}

/* =========================
   Main Layout
   ========================= */
export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [headerExpanded, setHeaderExpanded] = React.useState(false);
  const [userName, setUserName] = React.useState("");
  const [userRole, setUserRole] = React.useState("user");
  const location = useLocation();

  // Theme
  const [theme, setTheme] = React.useState(() => {
    try {
      const saved = localStorage.getItem("aul_theme");
      return saved === "dark" || saved === "light" ? saved : "dark";
    } catch {
      return "dark";
    }
  });
  const isDark = theme === "dark";

  // Notify and apply theme to <html>, expose global API
  const subscribersRef = React.useRef(new Set());

  React.useEffect(() => {
    // expose API once
    window.AuraTheme = {
      get: () => theme,
      set: (next) => {
        const t = next === "dark" ? "dark" : "light";
        try { localStorage.setItem("aul_theme", t); } catch {}
        setTheme(t);
      },
      subscribe: (cb) => {
        if (typeof cb === "function") {
          subscribersRef.current.add(cb);
          // immediate push current value
          try { cb(theme); } catch {}
          return () => subscribersRef.current.delete(cb);
        }
        return () => {};
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // create API once

  React.useEffect(() => {
    // apply to <html>
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.classList.toggle("theme-dark", theme === "dark");
    root.classList.toggle("theme-light", theme === "light");
    // notify subscribers
    subscribersRef.current.forEach((cb) => {
      try { cb(theme); } catch {}
    });
  }, [theme]);

  // Data
  React.useEffect(() => {
    const fetchUserAndIncomeSources = async () => {
      try {
        const currentUser = await User.me();
        const displayName = currentUser.preferred_name || (currentUser.full_name?.split(" ")[0]) || "";
        setUserName(displayName);
        setUserRole(currentUser.role || "user");
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUserAndIncomeSources();
  }, []);

  // QuickActions state
  const [showLogForm, setShowLogForm] = React.useState(false);
  const [showAddBillForm, setShowAddBillForm] = React.useState(false);
  const [showAddSubForm, setShowAddSubForm] = React.useState(false);
  const [incomeSources, setIncomeSources] = React.useState([]);

  React.useEffect(() => {
    const handleOpenLogIncomeModal = () => setShowLogForm(true);
    const handleOpenAddBillModal = () => setShowAddBillForm(true);
    const handleOpenAddSubModal = () => setShowAddSubForm(true);

    window.addEventListener("openLogIncomeModal", handleOpenLogIncomeModal);
    window.addEventListener("openAddBillModal", handleOpenAddBillModal);
    window.addEventListener("openAddSubModal", handleOpenAddSubModal);

    return () => {
      window.removeEventListener("openLogIncomeModal", handleOpenLogIncomeModal);
      window.removeEventListener("openAddBillModal", handleOpenAddBillModal);
      window.removeEventListener("openAddSubModal", handleOpenAddSubModal);
    };
  }, []);

  const toggleTheme = () => window.AuraTheme.set(isDark ? "light" : "dark");

  const handleLogIncomeClick = () => setShowLogForm(true);
  const handleAddBillClick = () => setShowAddBillForm(true);
  const handleAddSubClick = () => setShowAddSubForm(true);

  const handleLogSubmit = async (data) => {
    try {
      const existing = await LoggedIncome.filter({ entryHash: data.entryHash });
      if (existing.length > 0) {
        toast.error("Duplicate Entry", { description: "This income entry appears to have already been logged." });
        return;
      }
      await LoggedIncome.create(data);

      const source = incomeSources.find((s) => s.id === data.incomeSourceId);
      if (source && (source.payFrequency === "weekly" || source.payFrequency === "bi-weekly")) {
        try {
          const currentPayday = parseISO(source.nextPayday);
          const daysToAdd = source.payFrequency === "weekly" ? 7 : 14;
          const nextPayday = add(currentPayday, { days: daysToAdd });

          await IncomeSource.update(source.id, { nextPayday: format(nextPayday, "yyyy-MM-dd") });
          toast.info(`'${source.name}' next payday advanced to ${format(nextPayday, "MMM d")}.`);
        } catch (updateError) {
          console.error("Failed to advance income source payday:", updateError);
          toast.error("Logged income, but failed to update next payday for the source.");
        }
      }

      toast.success("Income logged successfully!");
      setShowLogForm(false);

      const sources = await IncomeSource.list();
      setIncomeSources(sources || []);
    } catch (error) {
      console.error("Error logging income:", error);
      toast.error("Failed to log income.");
    }
  };

  const handleAddBillSubmit = async (billData) => {
    try {
      await Bill.create(billData);
      toast.success("Bill added successfully!");
      setShowAddBillForm(false);
    } catch (error) {
      console.error("Error adding bill:", error);
      toast.error("Failed to add bill.");
    }
  };

  const handleAddSubSubmit = async (subData) => {
    try {
      await Subscription.create(subData);
      toast.success("Subscription added successfully!");
      setShowAddSubForm(false);
    } catch (error) {
      console.error("Error adding subscription:", error);
      toast.error("Failed to add subscription.");
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (currentPageName === "Agents") return <>{children}</>;

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark ? "dashboard-bg" : ""}`}>
      <style>
        {`
          .dashboard-bg {
            background: linear-gradient(135deg, #000000 0%, #1a0b2e 25%, #0f0f23 50%, #16213e 75%, #0f172a 100%);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
          }
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .glass-panel { background: rgba(255, 255, 255, 0.06); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.14); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
          .glass-light { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); }
          .glass-dark  { background: rgba(0, 0, 0, 0.22); backdrop-filter: blur(10px); }
          .glass-hover { background: rgba(255, 255, 255, 0.14); backdrop-filter: blur(15px); }
          .text-glass { color: rgba(255, 255, 255, 0.95); text-shadow: 0 1px 3px rgba(0,0,0,0.3); }
          .text-glass-muted { color: rgba(255, 255, 255, 0.7); }
          @media (prefers-reduced-motion: reduce) { .dashboard-bg { animation: none; } }
          [data-radix-dialog-content] { position: fixed !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; max-height: 90vh !important; overflow-y: auto !important; margin: 0 !important; z-index: 9999 !important; }
          @media (max-width: 640px) { [data-radix-dialog-content] { width: 95vw !important; max-width: 95vw !important; } }
          @media (min-width: 641px) and (max-width: 1024px) { [data-radix-dialog-content] { width: 90vw !important; max-width: 90vw !important; } }
          @media (min-width: 1025px) { [data-radix-dialog-content] { width: auto !important; max-width: 85vw !important; } }
        `}
      </style>

      {!isDark && <OldBackground />}

      {/* Desktop */}
      <div className="hidden lg:block relative z-10 h-screen">
        <header
          className={[
            isDark ? "glass-panel border-white/20 shadow-lg" : "backdrop-blur-xl bg-black/20 border-b border-white/20 shadow-lg",
            "transition-all duration-300",
            headerExpanded ? "pb-4" : ""
          ].join(" ")}
        >
          <div className="p-3">
            <div className="mx-6 flex items-center justify-between">
              <Link to={createPageUrl("dashboard")}>
                <h1 className="text-2xl font-bold text-glass cursor-pointer hover:opacity-90 transition-opacity">Welcome back, {userName}! 👋</h1>
              </Link>

              <div className={isDark ? "glass-light flex items-center gap-2 sm:gap-4 rounded-full border border-white/10 px-2 py-1 sm:px-4 sm:py-2" : "bg-black/30 flex items-center gap-2 sm:gap-4 backdrop-blur-md rounded-full border border-white/10 px-2 py-1 sm:px-4 sm:py-2"}>
                {userRole === "admin" && (
                  <button onClick={handleAddBillClick} className="block">
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                      <div className={isDark ? "p-2 sm:p-3 glass-light rounded-full" : "p-2 sm:p-3 bg-white/10 rounded-full"}>
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs text-glass-muted hidden sm:inline">Add Bill</span>
                    </div>
                  </button>
                )}
                {userRole === "admin" && (
                  <button onClick={handleAddSubClick} className="block">
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                      <div className={isDark ? "p-2 sm:p-3 glass-light rounded-full" : "p-2 sm:p-3 bg-white/10 rounded-full"}>
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs text-glass-muted hidden sm:inline">Add Sub</span>
                    </div>
                  </button>
                )}
                <button onClick={handleLogIncomeClick} className="block">
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                    <div className={isDark ? "p-2 sm:p-3 glass-light rounded-full" : "p-2 sm:p-3 bg-white/10 rounded-full"}>
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-glass-muted hidden sm:inline">Log Income</span>
                  </div>
                </button>
                <button onClick={() => setHeaderExpanded(!headerExpanded)} className="block">
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                    <div className={isDark ? "p-2 sm:p-3 glass-light rounded-full" : "p-2 sm:p-3 bg-white/10 rounded-full"}>
                      <Menu className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-glass-muted hidden sm:inline">Menu</span>
                  </div>
                </button>

                {/* Theme toggle if you still want it visible here */}
                
              </div>
            </div>
          </div>
          {headerExpanded && (
            <div className="mx-6 mt-4 pb-4 border-t border-white/20 pt-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-10">
                  <div className="grid grid-cols-5 gap-4">
                    {mainNavItems.map((item) => (
                      <NavItem key={item.title} item={item} isActive={location.pathname === item.url} />
                    ))}
                  </div>
                </div>
                <div className="col-span-2 flex flex-col justify-center gap-2">
                  <Link to={createPageUrl("settings")} className="flex-1 p-3 text-center rounded-xl transition-all duration-300 glass-light hover:glass-hover border border-white/10">
                    <Settings className="w-4 h-4 text-white mx-auto" />
                  </Link>
                  <button onClick={async () => { await User.logout(); }} className="flex-1 p-3 text-center rounded-xl transition-all duration-300 glass-light hover:glass-hover border border-white/10">
                    <LogOut className="w-4 h-4 text-white mx-auto" />
                  </button>
                </div>
              </div>

              {userRole === "admin" && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-glass-muted mb-2 px-2">Admin Tools</h4>
                  <div className="grid grid-cols-5 gap-4">
                    {adminNavItems.map((item) => (
                      <NavItem key={item.title} item={item} isActive={location.pathname === item.url} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </header>

        <aside className={["fixed top-0 right-0 h-full z-50 transition-all duration-300 ease-in-out", sidebarOpen ? "w-80" : "w-0", "overflow-hidden"].join(" ")}>
          <div className={`${isDark ? "glass-panel" : "bg-white/10 backdrop-blur-2xl"} my-20 p-6 w-80 h-100 border-l border-white/20 shadow-2xl flex flex-col`}>
            <SideNavigation />
          </div>
        </aside>

        <div className="w-full relative">
          <main className="overflow-auto" style={{ height: headerExpanded ? "calc(100vh - 200px)" : "calc(100vh - 80px)", overscrollBehaviorY: "contain" }}>
            {children}
          </main>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden relative z-10">
        <header className={[isDark ? "glass-panel border-white/20 shadow-lg" : "backdrop-blur-xl bg-black/20 border-b border-white/20 shadow-lg", "transition-all duration-300", headerExpanded ? "pb-4" : ""].join(" ")}>
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <Link to={createPageUrl("dashboard")}>
                <h1 className="text-base sm:text-lg font-bold text-glass cursor-pointer hover:opacity-90 transition-opacity leading-tight">
                  Welcome back, {userName}! 👋
                </h1>
              </Link>

              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <div className={isDark ? "glass-light flex items-center gap-1 rounded-full border border-white/10 px-1 py-1" : "bg-black/30 flex items-center gap-1 backdrop-blur-md rounded-full border border-white/10 px-1 py-1"}>
                    {userRole === "admin" && (
                      <button onClick={handleAddBillClick} className="block">
                        <div className="flex flex-col items-center gap-0">
                          <div className={isDark ? "p-1.5 glass-light rounded-full" : "p-1.5 bg-white/10 rounded-full"}>
                            <Plus className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      </button>
                    )}
                    {userRole === "admin" && (
                      <button onClick={handleAddSubClick} className="block">
                        <div className="flex flex-col items-center gap-0">
                          <div className={isDark ? "p-1.5 glass-light rounded-full" : "p-1.5 bg-white/10 rounded-full"}>
                            <CreditCard className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      </button>
                    )}
                    <button onClick={handleLogIncomeClick} className="block">
                      <div className="flex flex-col items-center gap-0">
                        <div className={isDark ? "p-1.5 glass-light rounded-full" : "p-1.5 bg-white/10 rounded-full"}>
                          <DollarSign className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    </button>
                    <button onClick={() => setHeaderExpanded(!headerExpanded)} className="block lg:hidden">
                      <div className="flex flex-col items-center gap-0">
                        <div className={isDark ? "p-1.5 glass-light rounded-full" : "p-1.5 bg-white/10 rounded-full"}>
                          <Menu className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    </button>

                    {/* Optional theme toggle here too */}
                  </div>

                  <SheetContent side="right" className={`${isDark ? "glass-panel" : "bg-white/10 backdrop-blur-2xl"} w-80 border-l border-white/20 p-0`}>
                    <div className="p-4 sm:p-6 h-full">
                      <SideNavigation />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>

          {headerExpanded && (
            <div className="mx-3 sm:mx-4 mt-4 pb-4 border-t border-white/20 pt-4">
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {mainNavItems.map((item) => (
                  <Link key={item.title} to={item.url} className="p-3 relative group block rounded-xl transition-all duration-300 border border-white/10 glass-light hover:glass-hover">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${item.gradient} shadow-lg`}>
                        <item.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-glass font-medium text-base whitespace-nowrap">{item.title}</span>
                    </div>
                  </Link>
                ))}

                {userRole === "admin" && (
                  <>
                    <div className="pt-2 pb-1"><div className="border-t border-white/20" /></div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-glass-muted mb-1 px-2">Admin Tools</h4>
                    {adminNavItems.map((item) => (
                      <Link key={item.title} to={item.url} className="p-3 relative group block rounded-xl transition-all duration-300 border border-white/10 glass-light hover:glass-hover">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${item.gradient} shadow-lg`}>
                            <item.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-glass font-medium text-base whitespace-nowrap">{item.title}</span>
                        </div>
                      </Link>
                    ))}
                  </>
                )}

                <div className="pt-2 pb-1"><div className="border-t border-white/20" /></div>
                <Link to={createPageUrl("settings")} className="p-3 relative group block rounded-xl transition-all duration-300 border border-white/10 glass-light hover:glass-hover">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-400 to-purple-500 shadow-lg">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-glass font-medium text-base">Settings</span>
                  </div>
                </Link>
                <button onClick={async () => { await User.logout(); }} className="p-3 relative group block rounded-xl transition-all duration-300 border border-white/10 glass-light hover:glass-hover text-left w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 shadow-lg">
                      <LogOut className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-glass font-medium text-base">Log Out</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </header>

        <main className="overflow-auto px-0" style={{ height: headerExpanded ? "calc(100vh - 280px)" : "calc(100vh - 72px)", overscrollBehaviorY: "contain" }}>
          {children}
        </main>
      </div>

      {/* Modals */}
      <LogIncomeForm isOpen={showLogForm} sources={incomeSources} onSubmit={handleLogSubmit} onCancel={() => setShowLogForm(false)} />

      {userRole === "admin" && (
        <Dialog open={showAddBillForm} onOpenChange={setShowAddBillForm}>
          <DialogContent className="glass-panel text-white border-white/20 max-w-2xl">
            <DialogHeader><DialogTitle>Add New Bill</DialogTitle></DialogHeader>
            <BillForm onSubmit={handleAddBillSubmit} onCancel={() => setShowAddBillForm(false)} />
          </DialogContent>
        </Dialog>
      )}

      {userRole === "admin" && (
        <Dialog open={showAddSubForm} onOpenChange={setShowAddSubForm}>
          <DialogContent className="glass-panel text-white border-white/20 max-w-2xl">
            <DialogHeader><DialogTitle>Add New Subscription</DialogTitle></DialogHeader>
            <SubscriptionForm onSubmit={handleAddSubSubmit} onCancel={() => setShowAddSubForm(false)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
