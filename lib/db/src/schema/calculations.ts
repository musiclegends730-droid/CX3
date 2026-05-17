import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./users";

export const calculationsTable = pgTable("calculations", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  calculator_type: text("calculator_type").notNull(), // 'wind_triangle', 'true_airspeed', etc.
  input_data: jsonb("input_data").notNull(),
  result: jsonb("result").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const insertCalculationSchema = createInsertSchema(calculationsTable).omit({ id: true, created_at: true }) as any;
export type InsertCalculation = z.infer<typeof insertCalculationSchema>;
export type Calculation = typeof calculationsTable.$inferSelect;
