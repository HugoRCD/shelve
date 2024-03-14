type Where = "home" | "app"| "admin";

export type Navigation = {
  name: string;
  title: string;
  to: string;
  icon: string;
};

export function getNavigation(where: Where): Navigation[] {
  switch (where) {
    case "home":
      return [
        { name: "Home", to: "/", icon: "i-heroicons-home", title: "Home" },
        { name: "Contact", to: "/contact", icon: "i-heroicons-envelope", title: "Contact" },
      ];
    case "app":
      return [
        {
          name: "Projects",
          to: "/app/projects",
          icon: "i-lucide-folder",
          title: "Projects",
        },
        {
          name: "Profile",
          to: "/app/profile",
          icon: "i-heroicons-user-circle",
          title: "Profile",
        },
        {
          name: "Settings",
          to: "/app/settings",
          icon: "i-heroicons-cog",
          title: "Settings",
        },
      ];
    case "admin":
      return [
        {
          name: "Users",
          to: "/admin/users",
          icon: "i-heroicons-users",
          title: "Users",
        },
      ];
    default:
      return [];
  }
}
