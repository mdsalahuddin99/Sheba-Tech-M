import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { toast } from "sonner";
import { useActiveAccounts, useAccountActions } from "./hooks";
import { ACCOUNT_TYPE_LABEL } from "./types";
import { formatCurrency } from "@/shared/lib/format";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "transfer" | "deposit" | "withdraw";
}

export function TransferDialog({ open, onOpenChange, defaultMode = "transfer" }: Props) {
  const accounts = useActiveAccounts();
  const { recordTransfer, recordDepositOrWithdraw } = useAccountActions();

  const [mode, setMode] = useState<"transfer" | "deposit" | "withdraw">(defaultMode);
  const [fromMethod, setFromMethod] = useState<string>("");
  const [toMethod, setToMethod] = useState<string>("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setMode(defaultMode);
    
    const initialFromType = accounts[0]?.type ?? "";
    const initialToType = accounts.length > 1 ? accounts[1]?.type : initialFromType;
    setFromMethod(initialFromType);
    setToMethod(initialToType);
    
    setFrom(accounts[0]?.id ?? "");
    setTo(accounts[1]?.id ?? "");
    setAmount("");
    setNote("");
  }, [open, defaultMode, accounts]);

  const submit = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error("Amount দিন");
    if (mode === "transfer") {
      if (!from || !to || from === to) return toast.error("Different from/to account select করুন");
      const ok = recordTransfer({ fromAccountId: from, toAccountId: to, amount: amt, note });
      if (!ok) return toast.error("Transfer failed");
      toast.success("Transfer recorded");
    } else {
      const acc = mode === "deposit" ? to || from : from;
      if (!acc) return toast.error("Account select করুন");
      const ok = recordDepositOrWithdraw({
        accountId: acc,
        direction: mode === "deposit" ? "in" : "out",
        amount: amt,
        note,
      });
      if (!ok) return toast.error("Failed");
      toast.success(`${mode} recorded`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Account Movement</DialogTitle>
          <DialogDescription className="text-center mt-2">Transfer / Deposit / Withdraw রেকর্ড করুন।</DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "transfer" | "deposit" | "withdraw")}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transfer">Transfer</TabsTrigger>
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4 px-2 sm:px-8 mt-4">
          {(mode === "transfer" || mode === "withdraw") && (
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {mode === "transfer" ? "From Type" : "Type"}
                </label>
                <Select value={fromMethod} onValueChange={(v) => {
                  setFromMethod(v);
                  const firstAcc = accounts.find((a) => a.type === v);
                  if (firstAcc) setFrom(firstAcc.id);
                }}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACCOUNT_TYPE_LABEL).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {mode === "transfer" ? "From Ledger" : "Account Ledger"}
                </label>
                <Select value={from} onValueChange={setFrom}>
                  <SelectTrigger><SelectValue placeholder="Choose account" /></SelectTrigger>
                  <SelectContent>
                    {accounts.filter(a => a.type === fromMethod).map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {(mode === "transfer" || mode === "deposit") && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {mode === "transfer" ? "To Type" : "Type"}
                </label>
                <Select value={toMethod} onValueChange={(v) => {
                  setToMethod(v);
                  const firstAcc = accounts.find((a) => a.type === v);
                  if (firstAcc) setTo(firstAcc.id);
                }}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACCOUNT_TYPE_LABEL).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">
                  {mode === "transfer" ? "To Ledger" : "Account Ledger"}
                </label>
                <Select value={to} onValueChange={setTo}>
                  <SelectTrigger><SelectValue placeholder="Choose account" /></SelectTrigger>
                  <SelectContent>
                    {accounts.filter(a => a.type === toMethod && a.id !== from).map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <label className="w-full sm:w-[120px] sm:text-left shrink-0 font-medium">Amount (৳)</label>
            <div className="flex-1 min-w-0">
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <label className="w-full sm:w-[120px] sm:text-left shrink-0 font-medium">Note</label>
            <div className="flex-1 min-w-0">
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          {amount && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <div className="w-full sm:w-[120px] shrink-0" />
              <p className="text-sm text-muted-foreground flex-1 min-w-0">
                Amount: <span className="font-semibold">{formatCurrency(Number(amount) || 0)}</span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={submit}>
            Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
