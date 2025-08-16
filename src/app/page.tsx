"use client";
import { useState } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { ConceptExplorer } from "@/components/concept-explorer";
import { QuizGenerator } from "@/components/quiz-generator";
import { InteractiveTutor } from "@/components/interactive-tutor";
import { FloatingStudyBuddy } from "@/components/floating-study-buddy";
import {
  MessageSquare,
  TestTube2,
  LogOut,
  User as UserIcon,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type View = "concept" | "quiz" | "tutor";

export default function Home() {
  const [view, setView] = useState<View>("tutor");
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/signin");
  };

  const getInitials = (
    name: string | null | undefined,
    email: string | null | undefined
  ) => {
    if (name) {
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <Logo className="size-8 text-primary" />
            <h1 className="text-xl font-semibold">StudyBoost</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setView("tutor")}
                isActive={view === "tutor"}
                tooltip={{
                  children: "Interactive Tutor",
                  side: "right",
                  align: "center",
                }}
              >
                <GraduationCap />
                <span>Interactive Tutor</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setView("concept")}
                isActive={view === "concept"}
                tooltip={{
                  children: "Explore Concepts",
                  side: "right",
                  align: "center",
                }}
              >
                <MessageSquare />
                <span>Concept Explorer</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setView("quiz")}
                isActive={view === "quiz"}
                tooltip={{
                  children: "Generate Quizzes",
                  side: "right",
                  align: "center",
                }}
              >
                <TestTube2 />
                <span>Quiz Generator</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {/* Footer can be used for other items later */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-end border-b bg-background/80 px-4 backdrop-blur-sm">
          <SidebarTrigger className="sm:hidden" />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(user?.displayName, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.displayName || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <UserIcon className="mr-2" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">
            {view === "tutor" && <InteractiveTutor />}
            {view === "concept" && <ConceptExplorer />}
            {view === "quiz" && <QuizGenerator />}
          </div>
        </main>
        <FloatingStudyBuddy />
      </SidebarInset>
    </SidebarProvider>
  );
}
