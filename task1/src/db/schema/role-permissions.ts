import { integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { permissions } from "./permissions";
import { roles } from "./roles";

export const rolePermissions = sqliteTable('role_permissions', {
  roleId: integer().references(() => roles.id),
  permissionId: integer().references(() => permissions.id),
});
