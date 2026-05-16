import { useState } from "react";
import { ReadoutValue } from "@/components/ui/ReadoutValue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { weightAndBalance } from "@/lib/aviation-calc";
import { Trash2, Plus } from "lucide-react";

interface WBRow {
  id: number;
  name: string;
  weight: string;
  arm: string;
}

const DEFAULT_ROWS: WBRow[] = [
  { id: 1, name: "Front Seats", weight: "", arm: "" },
  { id: 2, name: "Rear Seats", weight: "", arm: "" },
  { id: 3, name: "Fuel", weight: "", arm: "" },
  { id: 4, name: "Baggage", weight: "", arm: "" },
  { id: 5, name: "Empty Weight", weight: "", arm: "" },
];

let nextId = DEFAULT_ROWS.length + 1;

function safeNum(v: string): number | null {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

export function WeightBalance() {
  const [rows, setRows] = useState<WBRow[]>(DEFAULT_ROWS);
  const [cgMin, setCgMin] = useState("");
  const [cgMax, setCgMax] = useState("");
  const [maxWeight, setMaxWeight] = useState("");

  const validRows = rows.filter(
    (r) => safeNum(r.weight) !== null && safeNum(r.arm) !== null && r.weight !== "" && r.arm !== ""
  );

  const items = validRows.map((r) => ({
    name: r.name || "Unnamed",
    weightLbs: safeNum(r.weight)!,
    armIn: safeNum(r.arm)!,
  }));

  const wb = items.length > 0 ? weightAndBalance(items) : null;

  const cgMinN = safeNum(cgMin);
  const cgMaxN = safeNum(cgMax);
  const maxWeightN = safeNum(maxWeight);

  const cgOk =
    wb && cgMinN !== null && cgMaxN !== null
      ? wb.cg >= cgMinN && wb.cg <= cgMaxN
      : null;

  const weightOk =
    wb && maxWeightN !== null ? wb.totalWeight <= maxWeightN : null;

  const updateRow = (id: number, field: keyof WBRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: nextId++, name: "", weight: "", arm: "" },
    ]);
  };

  const removeRow = (id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="p-5">
      <div className="grid grid-cols-3 gap-3 mb-5 max-w-lg">
        <div className="space-y-1.5">
          <Label htmlFor="cg-min" className="text-xs">CG Fwd Limit (in)</Label>
          <Input id="cg-min" data-testid="input-cg-min" placeholder="e.g. 82" value={cgMin} onChange={(e) => setCgMin(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cg-max" className="text-xs">CG Aft Limit (in)</Label>
          <Input id="cg-max" data-testid="input-cg-max" placeholder="e.g. 95" value={cgMax} onChange={(e) => setCgMax(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="max-weight" className="text-xs">Max Gross (lbs)</Label>
          <Input id="max-weight" data-testid="input-max-weight" placeholder="e.g. 2550" value={maxWeight} onChange={(e) => setMaxWeight(e.target.value)} />
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden mb-3">
        <div className="grid grid-cols-[1fr_120px_120px_120px_40px] gap-0 bg-muted/50 border-b border-border px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Item</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right pr-2">Weight (lbs)</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right pr-2">Arm (in)</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right pr-2">Moment</span>
          <span />
        </div>
        {rows.map((row) => {
          const w = safeNum(row.weight);
          const a = safeNum(row.arm);
          const moment = w !== null && a !== null ? (w * a).toFixed(1) : "—";
          return (
            <div
              key={row.id}
              data-testid={`wb-row-${row.id}`}
              className="grid grid-cols-[1fr_120px_120px_120px_40px] gap-0 border-b border-border/50 last:border-b-0 px-3 py-2 items-center hover:bg-muted/20 transition-colors"
            >
              <Input
                data-testid={`wb-name-${row.id}`}
                placeholder="Item name"
                value={row.name}
                onChange={(e) => updateRow(row.id, "name", e.target.value)}
                className="border-0 bg-transparent h-8 p-0 focus-visible:ring-0 text-sm"
              />
              <div className="pr-2">
                <Input
                  data-testid={`wb-weight-${row.id}`}
                  placeholder="0"
                  value={row.weight}
                  onChange={(e) => updateRow(row.id, "weight", e.target.value)}
                  className="text-right h-8 text-sm"
                />
              </div>
              <div className="pr-2">
                <Input
                  data-testid={`wb-arm-${row.id}`}
                  placeholder="0.0"
                  value={row.arm}
                  onChange={(e) => updateRow(row.id, "arm", e.target.value)}
                  className="text-right h-8 text-sm"
                />
              </div>
              <span className="text-right pr-2 text-sm font-mono text-muted-foreground">{moment}</span>
              <button
                data-testid={`wb-remove-${row.id}`}
                onClick={() => removeRow(row.id)}
                className="text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        data-testid="wb-add-row"
        onClick={addRow}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold transition-colors mb-6"
      >
        <Plus className="w-4 h-4" /> Add Item
      </button>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ReadoutValue
          data-testid="result-total-weight"
          label="Total Weight"
          value={wb ? wb.totalWeight.toLocaleString() : "—"}
          unit="lbs"
          accent={weightOk === false ? "destructive" : weightOk === true ? "accent" : "primary"}
          tooltip="Sum of all item weights"
        />
        <ReadoutValue
          data-testid="result-total-moment"
          label="Total Moment"
          value={wb ? wb.totalMoment.toLocaleString() : "—"}
          unit="in·lbs"
          accent="muted"
          tooltip="Sum of all weight × arm moments"
        />
        <ReadoutValue
          data-testid="result-cg"
          label="Center of Gravity"
          value={wb ? wb.cg.toFixed(2) : "—"}
          unit="in"
          accent={cgOk === false ? "destructive" : cgOk === true ? "accent" : "primary"}
          tooltip="CG = Total Moment ÷ Total Weight"
        />
        <div className="flex flex-col bg-card/50 rounded-lg p-4 border shadow-sm border-border/50 gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
          {weightOk === false && (
            <span className="text-sm font-bold text-destructive">OVERWEIGHT</span>
          )}
          {cgOk === false && (
            <span className="text-sm font-bold text-destructive">CG OUT OF RANGE</span>
          )}
          {weightOk !== false && cgOk !== false && wb && (
            <span className="text-sm font-bold text-accent">WITHIN LIMITS</span>
          )}
          {!wb && (
            <span className="text-sm text-muted-foreground">Enter data</span>
          )}
        </div>
      </div>
    </div>
  );
}
