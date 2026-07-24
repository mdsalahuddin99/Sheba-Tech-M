export const MODULES = [
  {
    id: "sales",
    label: "Sales",
    actions: ["view", "create", "edit", "delete", "hold"],
  },
  {
    id: "products",
    label: "Products",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "product_categories",
    label: "Product Categories",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "inventory",
    label: "Inventory",
    actions: ["view", "adjust", "transfer"],
  },
  {
    id: "customers",
    label: "Customers",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "suppliers",
    label: "Suppliers",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "purchases",
    label: "Purchases",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "expenses",
    label: "Expenses",
    actions: ["view", "create", "edit", "delete", "view_all_users"],
  },
  {
    id: "expense_categories",
    label: "Expense Categories",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "reports",
    label: "Reports",
    actions: ["view"],
  },
  {
    id: "ecommerce",
    label: "eCommerce",
    actions: ["view", "manage_orders", "manage_settings"],
  },
  {
    id: "warranty",
    label: "Warranty",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "settings",
    label: "Settings",
    actions: ["view", "edit"],
  },
] as const;

export type PermissionModule = typeof MODULES[number]["id"];
export type PermissionAction = string;

// Helper to generate a flat list of all possible permission strings (e.g., "sales:create")
export const AVAILABLE_PERMISSIONS: string[] = MODULES.flatMap((mod) =>
  mod.actions.map((action) => `${mod.id}:${action}`)
);
