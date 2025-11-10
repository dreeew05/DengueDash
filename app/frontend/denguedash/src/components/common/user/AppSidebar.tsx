import * as React from "react";
import {
  AudioWaveform,
  BadgeCheck,
  ChevronRight,
  ChevronsUpDown,
  Command,
  FolderMinus,
  GalleryVerticalEnd,
  Hospital,
  LogOut,
  Table,
  TrendingUpDown,
  UserPlus,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@shadcn/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@shadcn/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shadcn/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@shadcn/components/ui/sidebar";
import { useContext } from "react";
import { UserContext } from "@/contexts/UserContext";
import authService from "@/services/auth.service";
import { redirect } from "next/navigation";

type AppSidebarProps = {
  sectionSegment: string;
  isAdmin: boolean;
  druType: string;
};

interface NavSubItem {
  title: string;
  url: string;
}

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType;
  items: NavSubItem[];
}

export default function AppSidebar({
  sectionSegment,
  isAdmin,
  druType,
}: AppSidebarProps) {
  // Static data for user and teams.
  const { user } = useContext(UserContext);
  const userProfile = {
    name: user?.full_name,
    email: user?.email,
    avatar: "/avatars/shadcn.jpg",
  };

  const teams = [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ];

  // Common navigation items.
  const analyticsNav: NavItem = {
    title: "Analytics",
    url: "analytics",
    icon: TrendingUpDown,
    items: [
      {
        title: "Dashboard",
        url: isAdmin
          ? "/user/admin/analytics/dashboard"
          : "/user/encoder/analytics/dashboard",
      },
      {
        title: "Forecasting",
        url: isAdmin
          ? "/user/admin/analytics/forecasting"
          : "/user/encoder/analytics/forecasting",
      },
    ],
  };

  const dataTablesNav: NavItem = {
    title: "Data Tables",
    url: "data-tables",
    icon: Table,
    items: [
      {
        title: "Dengue Reports",
        url: isAdmin
          ? "/user/admin/data-tables/dengue-reports"
          : "/user/encoder/data-tables/dengue-reports",
      },
    ],
  };

  // Items that differ by role.
  const adminNav: NavItem[] = [
    {
      title: "Accounts",
      url: "accounts",
      icon: UserPlus,
      items: [{ title: "Manage Accounts", url: "/user/admin/accounts/manage" }],
    },
  ];

  const userNav: NavItem[] = [
    {
      title: "Forms",
      url: "forms",
      icon: FolderMinus,
      items: [
        {
          title: "Case Report Form",
          url: "/user/encoder/forms/case-report-form",
        },
      ],
    },
  ];

  const manageDruNav: NavItem[] = [
    {
      title: "DRU",
      url: "dru",
      icon: Hospital,
      items: [
        {
          title: "Manage DRU",
          url: "/user/admin/dru/manage",
        },
        {
          title: "Add DRU",
          url: "/user/admin/dru/add",
        },
      ],
    },
  ];

  // Build the navigation array based on isAdmin flag.
  const navMain: NavItem[] = isAdmin
    ? [
        ...adminNav,
        ...(druType === "RESU" || druType === "PESU" || druType === "CESU"
          ? [...manageDruNav]
          : []),
        analyticsNav,
        dataTablesNav,
      ].filter(Boolean) // Filter out any false values
    : [analyticsNav, ...userNav, dataTablesNav];

  const [activeTeam] = React.useState(teams[0]);

  const logoutUser = async () => {
    await authService.logout();
    redirect("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <activeTeam.logo className="size-4" />
                  </div>
                  <div className="ml-1 grid flex-1 text-2xl text-left leading-tight">
                    <span className="truncate font-semibold">DengueDash</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Modules</SidebarGroupLabel>
          <SidebarMenu>
            {navMain.map((item) => (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={sectionSegment === item.url}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={userProfile.avatar}
                      alt={userProfile.name}
                    />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {userProfile.name}
                    </span>
                    <span className="truncate text-xs">
                      {userProfile.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={userProfile.avatar}
                        alt={userProfile.name}
                      />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {userProfile.name}
                      </span>
                      <span className="truncate text-xs">
                        {userProfile.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    {isAdmin ? (
                      <a
                        href="/user/admin/me"
                        className="flex flex-row gap-2 items-center"
                      >
                        <BadgeCheck />
                        Account
                      </a>
                    ) : (
                      <a
                        href="/user/encoder/me"
                        className="flex flex-row gap-2 items-center"
                      >
                        <BadgeCheck />
                        Account
                      </a>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logoutUser()}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
