import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Briefcase, LogOut, Plus, User } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
              <Briefcase className="h-5 w-5" />
              <span>JobBoard</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/">
                <Button
                  variant={isActive("/") ? "secondary" : "ghost"}
                  size="sm"
                  className="text-sm"
                >
                  Jobs
                </Button>
              </Link>
              {session && (
                <Link to="/recruiter">
                  <Button
                    variant={isActive("/recruiter") ? "secondary" : "ghost"}
                    size="sm"
                    className="text-sm"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Post a Job
                  </Button>
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {isPending ? (
              <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
            ) : session ? (
              <>
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  {session.user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="animate-fade-in">{children}</main>
    </div>
  );
};

export default Layout;
